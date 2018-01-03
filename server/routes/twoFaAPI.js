var express = require('express');
var router = express.Router();
var twoFaAPIController = require('../controllers/twoFaAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/sendMessage', twoFaAPIController.send_message);
router.post('/verifyCode', twoFaAPIController.verify_code);

module.exports = router;
