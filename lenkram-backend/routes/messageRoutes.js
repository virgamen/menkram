const express = require('express');
const router = express.Router();

const messageCtr = require('../controllers/messages');
const AuthHelpers = require('../Helpers/AuthHelpers');

router.post('/chat-message/:sender_Id/:receiver_Id', AuthHelpers.VerifyToken, messageCtr.SendMessage);

router.get('/chat-message/:sender_Id/:receiver_Id', AuthHelpers.VerifyToken, messageCtr.GetAllMessages);
router.get('/receiver-messages/:sender/:receiver', AuthHelpers.VerifyToken, messageCtr.MarkReceiverMessages);
router.get('/mark-all-messages', AuthHelpers.VerifyToken, messageCtr.MarkAllMessages);

module.exports = router;