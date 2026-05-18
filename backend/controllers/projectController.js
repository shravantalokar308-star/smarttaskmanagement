const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendProjectInvitationEmail } = require('../utils/emailService');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Create project with creator as admin in members list
    const project = await Project.create({
      name,
      description,
      creator: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'admin',
        },
      ],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('creator', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Find projects where the current user is in the members list
    const projects = await Project.find({
      'members.user': req.user.id,
    })
      .populate('creator', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project details with tasks and members
// @route   GET /api/projects/:id
// @access  Private
const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find all tasks related to this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .sort({ createdAt: -1 });

    res.json({
      project,
      tasks,
    });
  } catch (error) {
    console.error('Get project details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to project by email
// @route   POST /api/projects/:id/members
// @access  Private (Admin only, handled by checkProjectRole('admin'))
const addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const project = req.project; // Injected by role middleware

    // Check if user is already a member
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add user as a member
    project.members.push({
      user: userToAdd._id,
      role: 'member',
    });

    await project.save();

    // Trigger asynchronous email invitation dispatch (non-blocking)
    sendProjectInvitationEmail({
      toEmail: userToAdd.email,
      toName: userToAdd.name,
      inviterName: req.user.name,
      projectName: project.name,
      projectId: project._id,
    }).catch((err) => {
      console.error('Safe catch: Project invitation email dispatch failed:', err);
    });

    const updatedProject = await Project.findById(project._id)
      .populate('creator', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    res.json(updatedProject);
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin only, handled by checkProjectRole('admin'))
const removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = req.project; // Injected by role middleware

    // Prevent creator from being removed
    if (project.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project creator' });
    }

    // Find member index
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in project' });
    }

    // Remove member
    project.members.splice(memberIndex, 1);
    await project.save();

    // Re-assign tasks assigned to the removed member back to unassigned (null) in this project
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: null }
    );

    const updatedProject = await Project.findById(project._id)
      .populate('creator', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    res.json(updatedProject);
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectDetails,
  addProjectMember,
  removeProjectMember,
};
