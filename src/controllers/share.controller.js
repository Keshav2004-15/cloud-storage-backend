import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";

/* ================================
   CREATE SHARE LINK
================================ */
export const createShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { role = "viewer", expires_at = null } = req.body;

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    const { error } = await supabase
      .from("shares")
      .insert({
        file_id: fileId,
        owner_id: req.user.userId,
        role,
        token,
        expires_at
      });

    if (error) throw error;

    res.status(201).json({
      message: "Share link created",
      shareUrl: `${process.env.BASE_URL}/share/${token}`,
      role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   ACCESS SHARED FILE (PUBLIC)
================================ */
export const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Get share record
    const { data: share, error: shareError } = await supabase
      .from("shares")
      .select("file_id, role, expires_at")
      .eq("token", token)
      .single();

    if (shareError || !share) {
      return res.status(404).json({ message: "Invalid or expired share link" });
    }

    // 2. Check expiry
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(403).json({ message: "Share link expired" });
    }

    // 3. Get file storage path
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("storage_path")
      .eq("id", share.file_id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 4. Generate signed URL (5 minutes)
    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("user-files")
        .createSignedUrl(file.storage_path, 300);

    if (signedError) throw signedError;

    res.json({
      signedUrl: signedData.signedUrl,
      role: share.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   REVOKE SHARE
================================ */
export const revokeShare = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("shares")
      .delete()
      .eq("id", id)
      .eq("owner_id", req.user.userId);

    if (error) throw error;

    res.json({ message: "Share revoked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

