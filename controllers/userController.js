const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Project = require("../models/Project");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("projects");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  const { username, email, role, password } = req.body;

  try {
    const user = await User.findById(req.params.id).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "User edited successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.searchUsersByEmailExcludingProject = async (req, res) => {
  try {
    const { email, limit, projectId } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required." });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID." });
    }

    if (email.length > 100) {
      return res.status(400).json({ message: "Email query parameter is too long." });
    }

    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = 10;
    }

    const MAX_LIMIT = 100;
    if (parsedLimit > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const regex = new RegExp(escapeRegExp(email), "i");

    const users = await User.find({
      email: regex,
      projects: { $ne: projectId },
    })
      .populate("projects")
      .limit(parsedLimit);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsersByEmailExcludingProject:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.searchUsersInProject = async (req, res) => {
  try {
    const { email, limit, projectId } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required." });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID." });
    }

    if (email.length > 100) {
      return res.status(400).json({ message: "Email query parameter is too long." });
    }

    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      parsedLimit = 10; // Default to 10 results
    }

    const MAX_LIMIT = 100;
    if (parsedLimit > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const regex = new RegExp(escapeRegExp(email), "i");

    const project = await Project.findById(projectId).populate({
      path: "members",
      match: { email: regex },
      options: { limit: parsedLimit },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({ members: project.members });
  } catch (error) {
    console.log("Error in searchUsersInProject:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
