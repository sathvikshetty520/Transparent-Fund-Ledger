const multer = require("multer");
const path = require("path");
const fs = require("fs");

const env = require("../config/env");

const uploadDirectory = path.resolve(
  process.cwd(),
  env.uploadDir
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  }
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
];

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
    return;
  }

  const error = new Error(
    "Only PDF, JPEG, PNG, and WebP receipt files are allowed"
  );

  error.code = "INVALID_FILE_TYPE";

  cb(error);
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSize
  },
  fileFilter
});

module.exports = upload;