const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getDirectMessages,
  getBatchMessages,
  getConversations,
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { messageSchema } = require('../validators/schemas');

router.use(authenticate);

router.post('/', validate(messageSchema), sendMessage);
router.get('/conversations', getConversations);
router.get('/direct/:otherUserId', getDirectMessages);
router.get('/batch/:batchId', getBatchMessages);

module.exports = router;
