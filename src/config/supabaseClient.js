import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // ✅ ANON PUBLIC KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
