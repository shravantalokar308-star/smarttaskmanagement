const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin only, verified inside by checking project members list)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!title || !project || !dueDate) {
      return res.status(400).json({ message: 'Please add task title, project, and due date' });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check user's role in this project
    const member = projectDoc.members.find(
      (m) => m.user.toString() === req.user.id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Not authorized: You are not a member of this project' });
    }

    if (member.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only Admins can create tasks' });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user.id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Private (Admin can update all, Member can only update status if assigned)
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this task' });
    }

    // Check user role in project
    const member = project.members.find(
      (m) => m.user.toString() === req.user.id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    const isAdmin = member.role === 'admin';
    const isAssignedUser = task.assignedTo && task.assignedTo.toString() === req.user.id.toString();

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        message: 'Access denied: You are not assigned to this task nor are you a project Admin',
      });
    }

    if (isAdmin) {
      // Admin can update everything
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    } else {
      // Member can ONLY update status
      if (
        title !== undefined ||
        description !== undefined ||
        assignedTo !== undefined ||
        priority !== undefined ||
        dueDate !== undefined
      ) {
        return res.status(403).json({
          message: 'Access denied: Project members can only update their assigned task status',
        });
      }
      if (status !== undefined) {
        task.status = status;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor');

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this task' });
    }

    // Check user role in project
    const member = project.members.find(
      (m) => m.user.toString() === req.user.id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: Only project Admins can delete tasks',
      });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ message: 'Task successfully deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats for user
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Get all projects where user is member
    const userProjects = await Project.find({ 'members.user': req.user.id });
    const projectIds = userProjects.map((p) => p._id);

    // 2. Get all tasks in those projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    // 3. Filter stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'done').length;
    const pendingTasks = allTasks.filter((t) => t.status !== 'done').length;

    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.status !== 'done' && new Date(t.dueDate) < now
    ).length;

    // 4. Get tasks assigned to the user
    const assignedTasks = await Task.find({
      project: { $in: projectIds },
      assignedTo: req.user.id,
    })
      .populate('project', 'name')
      .populate('createdBy', 'name email avatarColor')
      .sort({ dueDate: 1 }); // Sort by due date ascending (closest first)

    // 5. Calculate progress percentage per project
    const projectsProgress = await Promise.all(
      userProjects.map(async (project) => {
        const pTasks = allTasks.filter(
          (t) => t.project.toString() === project._id.toString()
        );
        const total = pTasks.length;
        const completed = pTasks.filter((t) => t.status === 'done').length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        return {
          _id: project._id,
          name: project.name,
          progress: percentage,
          totalTasks: total,
          completedTasks: completed,
        };
      })
    );

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      assignedTasks,
      projectsProgress,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};
