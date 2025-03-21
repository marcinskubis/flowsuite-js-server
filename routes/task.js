const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  moveTaskToNewStatus,
} = require("../controllers/taskController");
const verifyToken = require("../middleware/tokenAuth");

const { checkTaskOwnershipOrAdmin, checkProjectAdminOrOwner } = require("../middleware/roleAuth");

const router = express.Router();

router.post("/", verifyToken, createTask);

router.get("/", verifyToken, getTasks);

router.get("/:id", verifyToken, getTaskById);

router.put("/:id", verifyToken, checkTaskOwnershipOrAdmin, updateTaskById);

router.delete("/:id", verifyToken, checkProjectAdminOrOwner, deleteTaskById);

router.put("/:id/move/:newStatusId", verifyToken, moveTaskToNewStatus);

module.exports = router;
