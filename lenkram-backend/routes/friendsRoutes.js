const express = require('express');
const router = express.Router();

const FriendsCtr = require('../controllers/friends');
const AuthHelpers = require('../Helpers/AuthHelpers');

router.post('/follow-user', AuthHelpers.VerifyToken, FriendsCtr.FollowUser);
router.post('/unfollow-user', AuthHelpers.VerifyToken, FriendsCtr.unFollowUser);
router.post('/mark/:id', AuthHelpers.VerifyToken, FriendsCtr.markNotifications);
router.post('/mark-all', AuthHelpers.VerifyToken, FriendsCtr.markAllNotifications);

module.exports = router;