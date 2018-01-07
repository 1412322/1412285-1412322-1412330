var express = require('express');
var router = express.Router();
var adminAPIController = require('../controllers/adminAPIController');
var User = require ('../models/user');
/* GET student list */

router.get('/total',  adminAPIController.get_total);
router.get('/transactionInfo',  adminAPIController.get_transaction_info);

module.exports = router;
