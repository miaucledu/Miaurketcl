const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dest = path.join(__dirname, "../../../../../../../uploads/productos");
fs.mkdirSync(dest, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dest),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
module.exports = upload.single("imagen");

