import { supabase } from "../config/supabaseClient.js";

export const search = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q = "", type = "files", page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 SEARCH FILES
    if (type === "files") {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .textSearch("search_vector", q)
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      return res.json({
        query: q,
        page: Number(page),
        limit: Number(limit),
        results: {
          files: data || []
        }
      });
    }

    // 🔍 SEARCH FOLDERS
    if (type === "folders") {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .ilike("name", `%${q}%`)
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      return res.json({
        query: q,
        page: Number(page),
        limit: Number(limit),
        results: {
          folders: data || []
        }
      });
    }

    // 🔍 SEARCH BOTH
    const [filesRes, foldersRes] = await Promise.all([
      supabase
        .from("files")
        .select("*")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .textSearch("search_vector", q)
        .range(offset, offset + Number(limit) - 1),

      supabase
        .from("folders")
        .select("*")
        .eq("owner_id", userId)
        .eq("is_deleted", false)
        .ilike("name", `%${q}%`)
        .range(offset, offset + Number(limit) - 1)
    ]);

    return res.json({
      query: q,
      page: Number(page),
      limit: Number(limit),
      results: {
        files: filesRes.data || [],
        folders: foldersRes.data || []
      }
    });
  } catch (err) {
    console.error("SEARCH ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
