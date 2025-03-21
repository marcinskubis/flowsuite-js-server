const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const Status = require("../models/Status");

exports.createProject = async (req, res) => {
  const { title, description, members } = req.body;
  const owner = req.user._id;

  let membersToAdd = members && members.length ? [...new Set([...members, owner])] : [owner];

  try {
    const newProject = new Project({
      title,
      description,
      owner,
      members: membersToAdd,
    });

    await newProject.save();

    const backlogStatus = new Status({
      name: "Backlog",
      project: newProject._id,
      color: "#00a5e0",
    });
    const doneStatus = new Status({
      name: "Done",
      project: newProject._id,
      color: "#109648",
    });
    const inProgressStatus = new Status({
      name: "In Progress",
      project: newProject._id,
      color: "#ce2d4f",
    });

    await Promise.all([backlogStatus.save(), doneStatus.save(), inProgressStatus.save()]);

    newProject.statuses = [backlogStatus._id, doneStatus._id, inProgressStatus._id];

    await newProject.save();

    await Promise.all(
      membersToAdd.map((member) =>
        User.findByIdAndUpdate(member, { $push: { projects: newProject._id } })
      )
    );

    const user = await User.findById(req.user._id).populate("projects").exec();
    res.cookie("userData", JSON.stringify(user), {
      secure: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

exports.assignUser = async (req, res) => {
  const { user } = req.body;
  const { projectId } = req.params;

  try {
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project does not exist." });
    }

    if (project.members.includes(user)) {
      return res.status(400).json({ message: "User is already assigned to the project." });
    }

    project.members.push(user);
    await project.save();

    await User.findByIdAndUpdate(user, { $push: { projects: projectId } });

    res.status(200).json({ message: "User assigned to the project successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error assigning user to the project", error: error.message });
  }
};

exports.removeUserFromProject = async (req, res) => {
  const { user } = req.body;
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.members.includes(user)) {
      return res.status(400).json({ message: "User is not a member of the project." });
    }

    project.members = project.members.filter((member) => member.toString() !== user);
    project.admins = project.admins.filter((admin) => admin.toString() !== user);

    await project.save();

    await Task.updateMany({ project: projectId, assignees: user }, { $pull: { assignees: user } });

    await User.findByIdAndUpdate(user, { $pull: { projects: projectId } });

    res.status(200).json({
      message: "User removed from the project and unassigned from all tasks successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing user from the project", error: error.message });
  }
};

exports.assignAdmin = async (req, res) => {
  const { member } = req.body;
  const { projectId } = req.params;
  const owner = req.user._id;
  if (owner === member) {
    return res
      .status(400)
      .json({ message: "User is owner of the project and cannot be assignes as admin." });
  }

  try {
    const userExists = await User.findById(member);
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project does not exist." });
    }

    if (!project.members.includes(member)) {
      return res.status(400).json({ message: "User is not member of the project." });
    }

    if (project.admins.includes(member)) {
      return res.status(400).json({ message: "User is already admin of the project." });
    }

    project.admins.push(member);
    await project.save();

    res.status(200).json({ message: "User assigned as admin successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error assigning user to the project", error: error.message });
  }
};

exports.deassignAdmin = async (req, res) => {
  const { user } = req.body;
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.admins.includes(user)) {
      return res.status(400).json({ message: "User is not an admin of the project." });
    }

    project.admins = project.admins.filter((admin) => admin.toString() !== user);

    await project.save();

    res.status(200).json({ message: "User removed as admin successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error removing user as admin", error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner admins members statuses");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner")
      .populate("admins")
      .populate("members")
      .populate({
        path: "statuses",
        populate: {
          path: "tasks",
          model: "Task",
          populate: [
            {
              path: "assignees",
              model: "User",
              select: "username avatarUrl email",
            },
            {
              path: "createdBy",
              model: "User",
              select: "username avatarUrl email",
            },
          ],
        },
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

exports.updateProjectById = async (req, res) => {
  const { title, description, graph, admins, members, statuses } = req.body;

  try {
    console.log(req.params.projectId);

    const project = await Project.findById(req.params.projectId);
    console.log(project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.admins = admins || project.admins;
    project.members = members || project.members;
    project.statuses = statuses || project.statuses;
    project.graph = graph || project.graph;

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};

exports.deleteProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const statuses = await Status.find({ project: project._id });
    for (const status of statuses) {
      await Task.deleteMany({ status: status._id });
    }

    await Status.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(project._id);

    res
      .status(200)
      .json({ message: "Project and all associated statuses and tasks deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};

exports.getProjectStatusesById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("statuses").exec();
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json(project);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting statuses for project.", error: error.message });
  }
};

exports.moveTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { newIndex, currentStatusId, newStatusId } = req.body;

    const project = await Project.findById(projectId).populate({
      path: "statuses",
      populate: {
        path: "tasks",
        model: "Task",
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentStatus = project.statuses.find(
      (status) => status._id.toString() === currentStatusId
    );
    const newStatus = project.statuses.find((status) => status._id.toString() === newStatusId);

    if (!currentStatus) {
      return res.status(404).json({ message: `Status with id ${currentStatusId} not found` });
    }

    const taskIndex = currentStatus.tasks.findIndex((task) => task._id.toString() === taskId);

    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ message: `Task with id ${taskId} not found in current status` });
    }

    const task = currentStatus.tasks.splice(taskIndex, 1)[0];

    task.status = newStatusId;

    if (currentStatusId === newStatusId) {
      currentStatus.tasks.splice(newIndex, 0, task);
      await currentStatus.save();
    } else {
      newStatus.tasks.splice(newIndex, 0, task);
      await currentStatus.save();
      await newStatus.save();
    }

    await task.save();

    res.status(200).json({ message: "Task moved successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
