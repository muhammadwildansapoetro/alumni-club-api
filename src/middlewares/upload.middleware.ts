import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads ada
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Buat nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `csv-${uniqueSuffix}${ext}`);
  },
});

// Filter untuk hanya menerima file CSV
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === "text/csv" ||
      file.mimetype === "application/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file CSV yang diperbolehkan"), false);
  }
};

// Konfigurasi multer
const uploadCSV = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware untuk upload single CSV file
export const uploadCSVSingle = uploadCSV.single("file");

// Middleware untuk handling error upload
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
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