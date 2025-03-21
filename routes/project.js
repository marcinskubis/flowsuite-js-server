const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  getProjectStatusesById,
  assignUser,
  removeUserFromProject,
  assignAdmin,
  deassignAdmin,
  moveTask,
} = require("../controllers/projectController");
const verifyToken = require("../middleware/tokenAuth"); // Middleware to protect routes

const {
  checkProjectOwner,
  checkProjectAdminOrOwner,
  checkProjectMember,
} = require("../middleware/roleAuth");

const router = express.Router();

router.post("/:projectId/tasks/:taskId/move", verifyToken, checkProjectMember, moveTask);

router.get("/:projectId/statuses", verifyToken, getProjectStatusesById);

router.post("/:projectId/assign", verifyToken, checkProjectAdminOrOwner, assignUser);

router.delete("/:projectId/deassign", verifyToken, checkProjectAdminOrOwner, removeUserFromProject);

router.put("/:projectId/assignAdmin", verifyToken, checkProjectOwner, assignAdmin);

router.put("/:projectId/deassignAdmin", verifyToken, checkProjectOwner, deassignAdmin);

router.get("/:projectId", verifyToken, checkProjectMember, getProjectById);

router.put("/:projectId", verifyToken, checkProjectAdminOrOwner, updateProjectById);

router.delete("/:projectId", verifyToken, checkProjectOwner, deleteProjectById);

router.post("/", verifyToken, createProject);

router.get("/", verifyToken, getProjects);

module.exports = router;
