const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getMyPayments,
  updatePaymentStatus,
  deletePayment,
} = require('../controllers/paymentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.post('/', logActivity('CREATE_PAYMENT', 'PAYMENT'), createPayment);
router.get('/my-payments', authorizeRoles('STUDENT'), getMyPayments);
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN'), getPayments);
router.put('/:id/status', authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('UPDATE_PAYMENT_STATUS', 'PAYMENT'), updatePaymentStatus);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_PAYMENT', 'PAYMENT'), deletePayment);

module.exports = router;
