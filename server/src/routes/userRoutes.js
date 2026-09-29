const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN'));

router.route('/')
  .get(getUsers)
  .post(logActivity('CREATE_USER', 'USER'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(logActivity('UPDATE_USER', 'USER'), updateUser)
  .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_USER', 'USER'), deleteUser);

module.exports = router;
