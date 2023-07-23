const express = require('express');
const router = express.Router();

const imageCtr = require('../controllers/images');
const AuthHelpers = require('../Helpers/AuthHelpers');


router.post('/upload-image', AuthHelpers.VerifyToken, imageCtr.UploadImage);

router.get('/set-default-image/:imgId/:imgVersion', AuthHelpers.VerifyToken, imageCtr.setDefault );

module.exports = router;