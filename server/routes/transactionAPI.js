var express = require('express');
var router = express.Router();
var transactionAPIController = require('../controllers/transactionAPIController');
var User = require ('../models/user');


router.post('/sendMoney',  transactionAPIController.send_money);
router.post('/verify/:key',transactionAPIController.verify_google_authenticator);
router.get('/history',  transactionAPIController.history);
router.get('/delete/:key',transactionAPIController.delete_initialized_transaction);

module.exports = router;
