var express = require('express');
var router = express.Router();
var transactionAPIController = require('../controllers/transactionAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/sendMoney',  transactionAPIController.send_money);
//router.post('/transaction',userAPIController.create_transaction);

module.exports = router;
