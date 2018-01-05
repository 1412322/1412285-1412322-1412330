var express = require('express');
var router = express.Router();
var twoFaAPIController = require('../controllers/twoFaAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/sendMessage', twoFaAPIController.send_message);
router.post('/verifyCode', twoFaAPIController.verify_code);
router.post('/sendMessageTMC', twoFaAPIController.send_message_tmc);
router.post('/sendMessageFirstTime', twoFaAPIController.send_message_first_time);
router.post('/verifyFirstTime', twoFaAPIController.verify_first_time);


module.exports = router;
