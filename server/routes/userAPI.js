var express = require('express');
var router = express.Router();
var userAPIController = require('../controllers/userAPIController');
var User = require ('../models/user');
/* GET student list */

router.post('/signup',  userAPIController.signup);
router.post('/signin',  userAPIController.signin);
router.get('/profile',  userAPIController.profile);
router.get('/verify/:id',userAPIController.verify_email);

module.exports = router;
