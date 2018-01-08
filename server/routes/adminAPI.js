var express = require('express');
var router = express.Router();
var adminAPIController = require('../controllers/adminAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/statistics/data',  adminAPIController.get_total);
router.post('/transactions/data',  adminAPIController.get_transaction_info);
router.post('/addresses/data',  adminAPIController.get_total_by_address);

module.exports = router;
