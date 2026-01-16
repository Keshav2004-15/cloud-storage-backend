import { supabase } from "../config/supabaseClient.js";

/* =========================
   UPLOAD FILE (Day-3 + Day-4)
   ========================= */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.userId;
    const { folder_id = null } = req.body;

    const file = req.file;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    const fileSize = file.size;

    const storagePath = `${userId}/${Date.now()}-${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(storagePath, file.buffer, {
        contentType: fileType
      });

    if (uploadError) throw uploadError;

    // Save metadata
    const { data, error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: fileName,
          mime_type: fileType,
          size: fileSize,
          storage_path: storagePath,
          owner_id: userId,
          folder_id
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({
      message: "File uploaded successfully",
      file: data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LIST FILES (Day-6 Pagination + Lazy Loading)
   ========================= */
export const listFiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      folder_id = null,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .range(offset, offset + limit - 1);

    if (folder_id) {
      query = query.eq("folder_id", folder_id);
    } else {
      query = query.is("folder_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      page: Number(page),
      limit: Number(limit),
      files: data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   RENAME FILE (Day-4)
   ========================= */
export const renameFile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name } = req.body;

    const { error } = await supabase
      .from("files")
      .update({ name })
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) throw error;

    res.json({ message: "File renamed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE FILE (SOFT DELETE / TRASH)
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

    if (error) throw error;

    res.json({ message: "File moved to trash" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
