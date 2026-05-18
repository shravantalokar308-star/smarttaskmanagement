const express = require('express');
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Get user stats across all projects (Place before :id to prevent mapping collision)
router.get('/dashboard', protect, getDashboardStats);

// Create task (admin validation is handled in the controller using req.body.project)
router.post('/', protect, createTask);

// Task updating and deletion (permission validations handled dynamically inside controller)
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
