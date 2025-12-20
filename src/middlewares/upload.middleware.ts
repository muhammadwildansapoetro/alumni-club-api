import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Pastikan folder uploads ada
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Buat nama file unik dengan timestamp dan random string untuk keamanan
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitizedFilename = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50); // Batasi panjang filename
    const ext = path.extname(sanitizedFilename);
    const nameWithoutExt = path.basename(sanitizedFilename, ext);

    cb(null, `csv-${timestamp}-${randomString}-${nameWithoutExt}${ext}`);
  },
});

// Filter yang lebih ketat untuk file CSV
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  // Validasi extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.csv') {
    return cb(new Error("Hanya file dengan ekstensi .csv yang diperbolehkan"), false);
  }

  // Validasi MIME type
  const allowedMimeTypes = [
    "text/csv",
    "text/comma-separated-values",
    "application/csv"
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Tipe file tidak valid. Hanya file CSV yang diperbolehkan"), false);
  }

  // Validasi filename untuk prevent path traversal
  const filename = file.originalname;
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return cb(new Error("Nama file tidak valid"), false);
  }

  cb(null, true);
};

// Konfigurasi multer dengan security enhancements
const uploadCSV = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size untuk mencegah DoS
    files: 1, // Hanya satu file
    fields: 10, // Maksimal 10 fields
    parts: 15, // Maksimal 15 parts (fields + files)
  },
});

// Middleware untuk upload single CSV file
export const uploadCSVSingle = uploadCSV.single("file");

// Middleware untuk handling error upload
export const handleUploadError = (err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Ukuran file terlalu besar. Maksimal 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Terlalu banyak file. Hanya satu file yang diperbolehkan",
      });
    }
  }

  if (err && err.message.includes("Hanya file CSV")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next(err);
};