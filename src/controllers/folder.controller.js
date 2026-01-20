import { supabase } from "../config/supabaseClient.js";

/* =========================
   CREATE FOLDER
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
          owner_id: req.user.userId,
          is_deleted: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Folder created successfully",
      folder: data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ROOT FOLDER (My Drive)
   ========================= */
export const getRootFolder = async (req, res) => {
  console.log("🔥🔥🔥 getRootFolder HIT 🔥🔥🔥");

  try {
    const userId = req.user.userId;

    /* Root folders */
    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .is("parent_id", null);

    if (folderError) throw folderError;

    /* Root files */
    const { data: files, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .is("folder_id", null);

    if (fileError) throw fileError;

    return res.json({
      folder: {
        id: null,
        name: "My Drive",
      },
      path: [],
      children: {
        folders: folders ?? [],
        files: files ?? [],
      },
    });
  } catch (err) {
    console.error("❌ getRootFolder error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET CHILD FOLDER BY ID
   ========================= */
export const getFolderById = async (req, res) => {
  console.log("📂📂📂 getFolderById HIT 📂📂📂");

  try {
    const userId = req.user.userId;
    const folderId = req.params.id;

    const { data: folder, error: folderErr } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .single();

    if (folderErr) throw folderErr;

    const { data: folders, error: childFolderErr } = await supabase
      .from("folders")
      .select("*")
      .eq("parent_id", folderId)
      .eq("owner_id", userId)
      .eq("is_deleted", false);

    if (childFolderErr) throw childFolderErr;

    const { data: files, error: fileErr } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId)
      .eq("owner_id", userId)
      .eq("is_deleted", false);

    if (fileErr) throw fileErr;

    const path = [];
    let current = folder;

    while (current) {
      path.unshift({ id: current.id, name: current.name });
      if (!current.parent_id) break;

      const { data: parent } = await supabase
        .from("folders")
        .select("id, name, parent_id")
        .eq("id", current.parent_id)
        .single();

      current = parent;
    }

    return res.json({
      folder,
      path,
      children: {
        folders: folders ?? [],
        files: files ?? [],
      },
    });
  } catch (err) {
    console.error("❌ getFolderById error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   LIST FOLDERS (Pagination)
   ========================= */
export const listFolders = async (req, res) => {
  console.log("❌❌❌ listFolders HIT ❌❌❌");

  try {
    const userId = req.user.userId;
    const { parent_id = null, page = 1, limit = 10 } = req.query;
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
      folders: data ?? [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   RENAME FOLDER
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
   DELETE FOLDER (SOFT DELETE)
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
