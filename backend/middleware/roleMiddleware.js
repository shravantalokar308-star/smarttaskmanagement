const Project = require('../models/Project');

// Middleware to verify if user has access to a project and what role they have
// It extracts the projectId from params (id or projectId) or body
const checkProjectRole = (requiredRoles = ['admin', 'member']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id || req.body.project;

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required for role validation' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user is a member of the project
      const member = project.members.find(
        (m) => m.user.toString() === req.user.id.toString()
      );

      if (!member) {
        return res.status(403).json({
          message: 'Access denied: You are not a member of this project',
        });
      }

      // Check if user's role in this project matches required roles
      if (!requiredRoles.includes(member.role)) {
        return res.status(403).json({
          message: `Access denied: Requires project role(s): ${requiredRoles.join(', ')}`,
        });
      }

      // Attach project and user's project-specific role to the request
      req.project = project;
      req.userProjectRole = member.role;

      next();
    } catch (error) {
      console.error('Error in project role middleware:', error);
      return res.status(500).json({ message: 'Server error during role validation' });
    }
  };
};

module.exports = { checkProjectRole };
