var express = require('express');
var router = express.Router();
var userAPIController = require('../controllers/userAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/signup',  userAPIController.signup);
router.post('/signin',  userAPIController.signin);
router.get('/profile',  userAPIController.profile);
router.get('/realmoney',  userAPIController.get_real_money);
router.get('/verify/:id',userAPIController.verify_email);
router.post('/forgetpassword',userAPIController.forget_password);
router.post('/resetpassword/:id',userAPIController.reset_password);
//router.post('/transaction',userAPIController.create_transaction);

module.exports = router;
