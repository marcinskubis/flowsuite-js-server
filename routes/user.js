const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  searchUsersByEmailExcludingProject,
  searchUsersInProject,
} = require("../controllers/userController");
const verifyToken = require("../middleware/tokenAuth");

const router = express.Router();

router.get("/search", verifyToken, searchUsersByEmailExcludingProject);

router.get("/", verifyToken, getUsers);

router.get("/searchProject", verifyToken, searchUsersInProject);

router.get("/:id", verifyToken, getUserById);

router.put("/:id", verifyToken, updateUserById);

router.delete("/:id", verifyToken, deleteUserById);

module.exports = router;
