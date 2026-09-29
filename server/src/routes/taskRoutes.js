const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  getMyStudentTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.get('/student/my-tasks', authorizeRoles('STUDENT'), getMyStudentTasks);

router.route('/')
  .get(getTasks)
  .post(
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(taskSchema),
    logActivity('CREATE_TASK', 'TASK'),
    createTask
  );

router.route('/:id')
  .get(getTaskById)
  .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), logActivity('UPDATE_TASK', 'TASK'), updateTask)
  .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_TASK', 'TASK'), deleteTask);

module.exports = router;
