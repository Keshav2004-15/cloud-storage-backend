import { supabase } from "../config/supabaseClient.js";

/* =========================
   UPLOAD FILE (Day 10)
   ========================= */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const userId = req.user.userId;
    const { folder_id = null } = req.body;

    const file = req.file;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    const fileSize = file.size;

    const storagePath = `${userId}/${Date.now()}-${fileName}`;

    /* =========================
       Upload to Supabase Storage
       ========================= */
    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(storagePath, file.buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({
        message: "Storage upload failed",
        error: uploadError.message,
      });
    }

    /* =========================
       Get Public URL (Preview)
       ========================= */
    const { data: publicUrlData } = supabase.storage
      .from("user-files")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    /* =========================
       Save Metadata to DB
       ========================= */
    const { data, error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: fileName,
          mime_type: fileType,
          size: fileSize,
          storage_path: storagePath,
          public_url: publicUrl,
          owner_id: userId,
          folder_id: folder_id || null,
          is_deleted: false,
        },
      ])
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({
        message: "Database insert failed",
        error: dbError.message,
      });
    }

    res.status(201).json({
      message: "File uploaded successfully",
      file: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected upload error",
      error: error.message,
    });
  }
};

/* =========================
   LIST FILES (Day 10)
   ========================= */
export const listFiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { folder_id = null } = req.query;

    let query = supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (folder_id) {
      query = query.eq("folder_id", folder_id);
    } else {
      query = query.is("folder_id", null);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch files",
        error: error.message,
      });
    }

    res.json({
      files: data || [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   RENAME FILE
   ========================= */
export const renameFile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "New name is required",
      });
    }

    const { error } = await supabase
      .from("files")
      .update({ name })
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      return res.status(500).json({
        message: "Rename failed",
        error: error.message,
      });
    }

    res.json({
      message: "File renamed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   DELETE FILE (SOFT DELETE)
   ========================= */
export const deleteFile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      return res.status(500).json({
        message: "Delete failed",
        error: error.message,
      });
    }

    res.json({
      message: "File moved to trash",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
