const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectDetails,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');

// General project operations (authenticated)
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

// Specific project operations (requires project access)
router.route('/:id')
  .get(protect, checkProjectRole(['admin', 'member']), getProjectDetails);

// Admin-only member management on projects
router.route('/:id/members')
  .post(protect, checkProjectRole(['admin']), addProjectMember);

router.route('/:id/members/:userId')
  .delete(protect, checkProjectRole(['admin']), removeProjectMember);

module.exports = router;
