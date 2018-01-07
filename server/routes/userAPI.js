var express = require('express');
var router = express.Router();
var userAPIController = require('../controllers/userAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/signup',  userAPIController.signup);
router.post('/verify/:key',userAPIController.verify_google_authenticator);
router.post('/signin',  userAPIController.signin);
router.get('/profile',  userAPIController.profile);
router.post('/qrCode/:key',  userAPIController.get_qr_code);

router.get('/realmoney',  userAPIController.get_real_money);
router.get('/verify/:id',userAPIController.verify_email);
router.post('/resetpassword',userAPIController.reset_password);

module.exports = router;
