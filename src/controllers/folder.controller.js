import { supabase } from "../config/supabaseClient.js";

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

    res.status(201).json({ message: "Folder created", folder: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listFolders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", req.user.userId)
      .eq("is_deleted", false);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    res.json({ message: "Folder renamed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
