const express = require('express');
const router  = express.Router();
const AuthHelpers = require('../Helpers/AuthHelpers');

const postsCtrl = require('../controllers/posts');

router.post('/post/add-post',AuthHelpers.VerifyToken, postsCtrl.AddPost);
router.post('/post/add-like', AuthHelpers.VerifyToken, postsCtrl.AddLike);
router.post('/post/add-like-view', AuthHelpers.VerifyToken, postsCtrl.AddLikeView);
router.post('/post/like-notification', AuthHelpers.VerifyToken, postsCtrl.LikeNotification);
router.post('/post/add-comment', AuthHelpers.VerifyToken, postsCtrl.AddComment);


router.get('/posts',AuthHelpers.VerifyToken, postsCtrl.GetAllPosts);
router.get('/post/:id', AuthHelpers.VerifyToken, postsCtrl.GetPost);
router.post('/post/comment-notification', AuthHelpers.VerifyToken, postsCtrl.CommentNotification);




module.exports = router;