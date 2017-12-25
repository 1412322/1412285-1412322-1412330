var express = require('express');
var router = express.Router();
var exchangeAPIController = require('../controllers/exchangeAPIController');
/* GET student list */

router.post('/create',  exchangeAPIController.create);
router.get('/exchangeListSend/:id',  exchangeAPIController.get_list_send_by_user);
router.get('/exchangeListReceive/:id',  exchangeAPIController.get_list_receive_by_user);
router.get('/exchangeList',  exchangeAPIController.get_list);

module.exports = router;
