import { supabase } from "../config/supabaseClient.js";

/* =========================
   CREATE FOLDER (Day-4)
   ========================= */
export const createFolder = async (req, res) => {
  try {
    const { name, parent_id = null } = req.body;

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          name,
          parent_id,
          owner_id: req.user.userId
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Folder created successfully",
      folder: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   LIST FOLDERS (Day-6 Pagination + Lazy Loading)
   ========================= */
export const listFolders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      parent_id = null,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from("folders")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .range(offset, offset + limit - 1);

    if (parent_id) {
      query = query.eq("parent_id", parent_id);
    } else {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      page: Number(page),
      limit: Number(limit),
      folders: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   RENAME FOLDER (Day-4)
   ========================= */
export const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", id)
      .eq("owner_id", req.user.userId);

    if (error) throw error;

    res.json({ message: "Folder renamed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE FOLDER (SOFT DELETE / TRASH)
   ========================= */
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("folders")
      .update({ is_deleted: true })
      .eq("id", id)
      .eq("owner_id", req.user.userId);

    if (error) throw error;

    res.json({ message: "Folder moved to trash" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
