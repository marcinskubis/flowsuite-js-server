const Project = require("../models/Project");
const Task = require("../models/Task");

const checkProjectAdminOrOwner = async (req, res, next) => {
  const projectId = req.params.projectId || req.body.project;
  const userId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.equals(userId)) {
      return next();
    }

    if (project.admins.includes(userId)) {
      return next();
    }

    return res.status(403).json({ message: "Access denied. Admin or Owner required." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkProjectMember = async (req, res, next) => {
  const projectId = req.params.projectId;
  const userId = req.user._id;
  console.log(projectId);

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.includes(userId);

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const checkTaskOwnershipOrAdmin = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ message: "Task not found. Middleware" });
    }

    const project = task.project;

    if (task.assignees.includes(userId)) {
      return next();
    }

    if (project.owner.equals(userId)) {
      return next();
    }

    if (project.admins.includes(userId)) {
      return next();
    }

    if (task.createdBy === userId) {
      return next();
    }

    return res.status(403).json({ message: "Access denied. Assignee, Admin, or Owner required." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkProjectOwner = async (req, res, next) => {
  const projectId = req.params.projectId || req.body.project;
  const userId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.equals(userId)) {
      return next();
    }

    return res.status(403).json({ message: "Access denied. Project owner required." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  checkProjectAdminOrOwner,
  checkTaskOwnershipOrAdmin,
  checkProjectOwner,
  checkProjectMember,
};
