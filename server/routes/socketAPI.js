var express = require('express');
var router = express.Router();
var socketAPIController = require('../controllers/socketAPIController');
/* GET student list */

router.get('/socket',  socketAPIController.get_socket);

module.exports = router;
