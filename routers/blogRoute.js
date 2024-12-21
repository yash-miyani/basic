const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  handleCreateBlog,
  handleUpdateBlog,
  handleGetAllBlog,
  handleDeleteBlog,
} = require("../controllers/blogController");
const { fetchUser } = require("../middleware/auth");
const router = express.Router();
// Image Upload Functionality
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = "static/blog";

    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) {
        cb(err);
      } else {
        cb(null, dest);
      }
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Create Blog
router.post("/", fetchUser, upload.single("image"), handleCreateBlog);

// Update Blog
router.put("/:id", fetchUser, upload.single("image"), handleUpdateBlog);

// Get All Blog
router.get("/all", handleGetAllBlog);

// Delete Blog
router.delete("/:id", fetchUser, handleDeleteBlog);

module.exports = router;
