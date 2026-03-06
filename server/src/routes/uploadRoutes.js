import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_")
    .substring(0, 200);
};

// Ensure upload directory exists for chat files
const uploadDir = path.join(__dirname, "../uploads/chat");
const avatarDir = path.join(__dirname, "../uploads/avatars");
[uploadDir, avatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed extensions whitelist
const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
]);

// Configure multer storage for chat files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();

    if (!allowedExtensions.has(ext)) {
      return cb(new Error("File extension not allowed"), false);
    }

    cb(null, uniqueSuffix + ext);
  },
});

// File filter - allow images and common document types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();

  if (!allowedExtensions.has(ext)) {
    return cb(new Error("File extension not allowed"), false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Avatar upload config (memory storage - we'll store in DB)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
    const allowedAvatarExtensions = new Set([
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
    ]);

    if (!allowedAvatarExtensions.has(ext)) {
      return cb(new Error("File extension not allowed for avatar"), false);
    }

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images allowed."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
});

// Upload single file (chat)
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/chat/${req.file.filename}`;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;

  res.json({
    success: true,
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
    mimetype: req.file.mimetype,
  });
});

// Upload avatar (stores in database)
router.post("/avatar", avatarUpload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = req.body.user_id;
  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    // Delete existing avatar if any
    await pool.query("DELETE FROM profile_pictures WHERE user_id = ?", [
      userId,
    ]);

    // Insert new avatar
    await pool.query(
      "INSERT INTO profile_pictures (user_id, file_data, mime_type, file_name) VALUES (?, ?, ?, ?)",
      [userId, req.file.buffer, req.file.mimetype, req.file.originalname],
    );

    // Update users table with reference
    await pool.query("UPDATE users SET profile_pic = ? WHERE id = ?", [
      `avatar:${userId}`,
      userId,
    ]);

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar_url: `/api/upload/avatar/${userId}`,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// Get avatar
router.options("/avatar/:userId", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).send();
});

router.get("/avatar/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT file_data, mime_type, file_name FROM profile_pictures WHERE user_id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Avatar not found" });
    }

    const avatar = rows[0];
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Content-Type", avatar.mime_type);
    res.set("Content-Disposition", `inline; filename="${avatar.file_name}"`);
    res.send(avatar.file_data);
  } catch (err) {
    console.error("Get avatar error:", err);
    res.status(500).json({ error: "Failed to get avatar" });
  }
});

// Delete avatar
router.delete("/avatar/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query("DELETE FROM profile_pictures WHERE user_id = ?", [
      userId,
    ]);
    await pool.query("UPDATE users SET profile_pic = NULL WHERE id = ?", [
      userId,
    ]);

    res.json({ success: true, message: "Avatar deleted" });
  } catch (err) {
    console.error("Delete avatar error:", err);
    res.status(500).json({ error: "Failed to delete avatar" });
  }
});

// Upload error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Max 10MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
