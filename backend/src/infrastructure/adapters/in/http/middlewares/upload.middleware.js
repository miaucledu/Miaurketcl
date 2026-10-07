const multer = require("multer");
const path = require("path");
const fs = require("fs");

const raw = process.env.UPLOADS_DIR || process.env.UPLOAD_DIR || "../uploads/productos";
const dest = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
fs.mkdirSync(dest, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dest),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
module.exports = upload.single("imagen");

