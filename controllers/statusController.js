const Status = require("../models/Status");
const Project = require("../models/Project");
const Task = require("../models/Task");

exports.createStatus = async (req, res) => {
  const { name, description, project, color } = req.body;

  try {
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newStatus = new Status({
      name,
      description,
      project,
      color,
    });

    await newStatus.save();

    await Project.findByIdAndUpdate(project, { $push: { statuses: newStatus._id } });
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: "Error creating status", error: error.message });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find().populate("project tasks");
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching statuses", error: error.message });
  }
};

exports.getStatusById = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id).populate("project tasks");
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: "Error fetching status", error: error.message });
  }
};

exports.updateStatusById = async (req, res) => {
  const { name, description, color } = req.body;

  try {
    const status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    status.name = name || status.name;
    status.description = description || status.description;
    status.color = color || status.color;

    await status.save();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

exports.deleteStatusById = async (req, res) => {
  try {
    console.log(req.params.id);

    const status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    await Task.deleteMany({ status: status._id });
    await Status.findByIdAndDelete(status._id);
    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting status", error: error.message });
  }
};
