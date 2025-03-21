const Task = require("../models/Task");
const Project = require("../models/Project");
const Status = require("../models/Status");

exports.createTask = async (req, res) => {
  const { title, description, status, project, assignees, startDate, endDate } = req.body;
  const createdBy = req.user._id;

  try {
    const projectExists = await Project.findById(project);
    const statusExists = await Status.findById(status);

    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!statusExists) {
      return res.status(404).json({ message: "Status not found" });
    }
    if (statusExists.tasks.length === statusExists.taskLimit) {
      return res.status(404).json({ message: "Task limit is met." });
    }

    const invalidAssignees = assignees.filter(
      (assignee) => !projectExists.members.includes(assignee)
    );
    if (invalidAssignees.length > 0) {
      return res.status(400).json({
        message: `The following users are not members of the project: ${invalidAssignees.join(
          ", "
        )}`,
      });
    }

    const newTask = new Task({
      title,
      description,
      status,
      project,
      assignees,
      startDate,
      endDate,
      createdBy,
    });

    await newTask.save();

    await Status.findByIdAndUpdate(status, { $push: { tasks: newTask._id } });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("status project assignees");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("status project assignees");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};

exports.updateTaskById = async (req, res) => {
  const { title, description, status, assignees, startDate, endDate } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignees = assignees || task.assignees;
    task.startDate = startDate || task.startDate;
    task.endDate = endDate || task.endDate;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

exports.deleteTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found. Func" });
    }

    await Task.findByIdAndDelete(req.params.id);

    const status = await Status.findById(task.status);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    await Status.findByIdAndUpdate(task.status, { $pull: { tasks: req.params.id } }, { new: true });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

exports.moveTaskToNewStatus = async (req, res) => {
  const { taskId, newStatusId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newStatus = await Status.findById(newStatusId);
    if (!newStatus) {
      return res.status(404).json({ message: "New status not found" });
    }

    if (!task.project.equals(newStatus.project)) {
      return res.status(400).json({ message: "New status must belong to the same project" });
    }

    task.status = newStatusId;
    await task.save();

    res.status(200).json({ message: "Task moved successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Error moving task", error: error.message });
  }
};
