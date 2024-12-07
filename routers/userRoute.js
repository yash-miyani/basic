const express = require("express");
const {
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleGetAllUser,
  handleLoginUser,
} = require("../controllers/userController");

const router = express.Router();

// Create User
router.post("/", handleCreateUser);

// Login User
router.post("/login", handleLoginUser);

// Update User
router.put("/:id", handleUpdateUser);

// Delete User
router.delete("/:id", handleDeleteUser);

// Get All User
router.get("/all", handleGetAllUser);

module.exports = router;
