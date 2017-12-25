var express = require('express');
var router = express.Router();
var walletAPIController = require('../controllers/walletAPIController');
var Wallet = require ('../models/wallet');
/* GET student list */

router.post('/create',  walletAPIController.create);
router.get('/walletInfo',  walletAPIController.get_wallet_info);
router.post('/walletInfoByEmail',  walletAPIController.get_wallet_info_by_email);
router.put('/walletUpdate',  walletAPIController.update_wallet);
router.get('/walletInfoByID/:id',  walletAPIController.get_wallet_info_by_id);

module.exports = router;
