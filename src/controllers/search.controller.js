import { supabase } from "../config/supabaseClient.js";

/* SEARCH FILES & FOLDERS */
export const search = async (req, res) => {
  try {
    const { q, type = "all", page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query missing" });
    }

    const offset = (page - 1) * limit;
    const userId = req.user.userId;

    let results = {};

    /* SEARCH FILES */
    if (type === "files" || type === "all") {
      const { data: files, error } = await supabase
        .from("files")
        .select("id, name, mime_type, folder_id")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .textSearch("search_vector", `${q}:*`)
        .range(offset, offset + limit - 1);

      if (error) throw error;
      results.files = files;
    }

    /* SEARCH FOLDERS */
    if (type === "folders" || type === "all") {
      const { data: folders, error } = await supabase
        .from("folders")
        .select("id, name, parent_id")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .textSearch("search_vector", `${q}:*`)
        .range(offset, offset + limit - 1);

      if (error) throw error;
      results.folders = folders;
    }

    res.json({
      query: q,
      page: Number(page),
      limit: Number(limit),
      results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
