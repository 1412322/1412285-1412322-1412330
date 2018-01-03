const Nexmo = require('nexmo');
var TMClient = require('textmagic-rest-client');
var User = require('../models/user');
var jwt = require('jwt-simple');
var config = require('../config/database');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
const nexmo = new Nexmo({
  apiKey: 'd2900963',
  apiSecret: '0e9028d758fe9957'
});

exports.send_message = function (req, res, next) {
  let phoneNumber = req.body.number;
  console.log(phoneNumber);
  nexmo.verify.request({number: phoneNumber, brand: 'KCoin Verify'}, (err,
  result) => {
    if(err) {
      //res.sendStatus(500);
      res.json({ success: false, msg: err });
    } else {
      let requestId = result.request_id;
      if(result.status == '0') {
        //res.render('verify', {requestId: requestId}); // Success! Now, have your user enter the PIN
        res.json({ success: true, requestId: requestId });
      } else {
        //res.status(401).send(result.error_text);
        res.json({ success: false, msg: result.error_text });
      }
    }
  });
}

exports.verify_code = function (req, res, next) {
  let pin = req.body.pin;
  let requestId = req.body.requestId;
  var c = new TMClient('username', 'C7XDKZOQZo6HvhJwtUw0MBcslfqwtp4');
  c.Messages.send({text: 'test message', phones:req.body.number}, function(err, res){
      console.log('Messages.send()', err, res);
  });
  nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
      // handle the error
      res.json({ success: false, msg: err });
    } else {
      if(result && result.status == '0') { // Success!
        res.json({ success: true, msg: 'Account verified!' });
      } else {
        // handle the error - e.g. wrong PIN
          res.json({ success: false, msg: ' wrong PIN' });
      }
    }
  });
}

exports.send_message_tmc = function (req, res, next) {
  var c = new TMClient('username', 'C7XDKZOQZo6HvhJwtUw0MBcslfqwtp4');
  c.Messages.send({text: 'test message', phones:req.body.number}, function(err, result){
    if(err) {
      // handle the error
      res.json({ success: false, msg: err });
    } else {
      res.json({ success: true, msg: 'Account verified!', result: result });
    }
  });
}
