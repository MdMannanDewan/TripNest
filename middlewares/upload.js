const multer = require("multer");
const path = require("path");
const CustomError = require("../utils/CustomError");

// 1.Keep files in memory buffers
const storage = multer.memoryStorage();

// 2.Determine allowed fileTypes
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/wepb",
]);

// 3.Set file filter
const fileFilter = (req, file, cb) => {
  // i.check MIME type
  if (!allowedTypes.has(file.mimetype)) {
    return cb(
      new CustomError(
        400,
        "Invalid file type. Only jpg,png,jpeg and webp is allowed"
      ),
      false
    );
  }
  // ii.check Extension (extra safety against fake mimetype)
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return cb(new CustomError(400, "Invalid file extension"), false);
  }
  // iii.Check for suspicious filenames(Prevents directory traversal attempts)
  if (file.originalname.includes("..")) {
    return cb(new Error("Invalid filename."), false);
  }
  // iv.accept file
  cb(null, true);
};

// 4.Multer instance with size limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
});

module.exports = upload;
