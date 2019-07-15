
const express = require("express");
const router = express.Router();
const uploadController = require('../controllers/upload');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

router.get("/fileList", uploadController.fileList);

router.get("/", uploadController.getAll);

router.get("/:fileID", uploadController.getFile);

router.post("/", upload.single('excelFile'), uploadController.uploadFile);

router.post("/:fileID", uploadController.uploadData);

router.delete("/:fileID", uploadController.deleteFileAndData);

module.exports = router;