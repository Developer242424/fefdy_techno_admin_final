const path = require("path");
const multer = require("multer");
const fs = require("fs");

const getDynamicUploader = (folder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!file) {
        cb(new Error("File is required"));
      }
      const uploadPath = path.join(__dirname, `../public/uploads/${folder}`);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|webp|pdf|csv|xlsx|svg|gif/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = file.mimetype;

      if (extname) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only files with extensions .jpeg, .jpg, .png, .webp, .pdf, .csv, .xlsx are allowed."
          )
        );
      }
    },
  });

  return upload;
};

module.exports = getDynamicUploader;
