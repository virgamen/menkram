const express = require('express');
const router = express.Router();

const UserCtr = require('../controllers/users');
const AuthHelpers = require('../Helpers/AuthHelpers');

router.get('/users', AuthHelpers.VerifyToken, UserCtr.GetAllUsers);
router.get('/users/:id', AuthHelpers.VerifyToken, UserCtr.GetUser);
router.get('/username/:username', AuthHelpers.VerifyToken, UserCtr.GetUserByName);
router.post('/user/view-profile', AuthHelpers.VerifyToken, UserCtr.ProfileView);
router.post('/user/change-password', AuthHelpers.VerifyToken, UserCtr.ChangePassword);

module.exports = router;