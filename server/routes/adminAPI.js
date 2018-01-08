var express = require('express');
var router = express.Router();
var adminAPIController = require('../controllers/adminAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/total',  adminAPIController.get_total);
router.post('/transactionInfo',  adminAPIController.get_transaction_info);
router.post('/totalByAddress',  adminAPIController.get_total_by_address);


module.exports = router;
