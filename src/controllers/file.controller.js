import { supabase } from "../config/supabaseClient.js";

export const uploadFile = async (req, res) => {
  try {
    // 1️⃣ Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 2️⃣ Get user info from auth middleware
    const userId = req.user.userId;

    // 3️⃣ File details
    const file = req.file;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    const fileSize = file.size;

    // 4️⃣ Define storage path
    const storagePath = `${userId}/${Date.now()}-${fileName}`;

    // 5️⃣ Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(storagePath, file.buffer, {
        contentType: fileType
      });

    if (uploadError) {
      throw uploadError;
    }

    // 6️⃣ Save file metadata to database
    const { error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: fileName,
          mime_type: fileType,
          size: fileSize,
          storage_path: storagePath,
          owner_id: userId
        }
      ]);

    if (dbError) {
      throw dbError;
    }

    // 7️⃣ Success response
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        name: fileName,
        size: fileSize,
        mime_type: fileType,
        storage_path: storagePath
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
