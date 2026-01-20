import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js";

/* ============================
   SIGNUP CONTROLLER
============================ */
export const signup = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      country_code,
      phone_number,
      date_of_birth,
      gender,
    } = req.body;

    // 🔴 Required field validation
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !country_code ||
      !phone_number ||
      !date_of_birth ||
      !gender
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // 🔴 Phone validation (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    // 🔴 Gender validation
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Invalid gender value",
      });
    }

    // 🔎 Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📦 Insert user into Supabase
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          first_name,
          middle_name: middle_name || null,
          last_name,
          email,
          password_hash: hashedPassword,
          country_code,
          phone_number,
          date_of_birth,
          gender,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 🔑 Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ============================
   LOGIN CONTROLLER
============================ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔎 Find user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 🔑 Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.json({
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ============================
   LOGOUT (STATELESS JWT)
============================ */
export const logout = async (req, res) => {
  res.json({
    message: "Logout successful",
  });
};
