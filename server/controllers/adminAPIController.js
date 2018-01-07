const Nexmo = require('nexmo');
var TMClient = require('textmagic-rest-client');
var authenticator = require('authenticator');
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

exports.get_total = function (req, res, next) {
  var token = getToken(req.headers);
  if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
          email: decoded.email
      }, function (err, user) {
          if (err) throw err;

          if (!user) {
              return res.status(403).send({ success: false, msg: 'User not found.' });
          } else {
            if (user.role == 'admin')
            {
              getTotalValue(res);
              //res.json({ success: true, msg: 'Authorized successfully' });
            }
            else
            {
              res.json({ success: false, msg: 'This user is not authorized to access this page', statusCode: 403 });
            }

          }
      });
  } else {
      return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
}

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization;
        if (parted) {
            return parted;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

getTotalValue = function(res)
{
  User.find(function(err,userList){
    if (err)
    {
      res.json({ success: false, msg: 'Get Total Value Failed!', error: err });
    }
    if (!userList) {
      res.json({ success: false, msg: 'Exchange not found!' });
    } else {
      var totalUser = userList.length;
      var totalRealMoney = 0;
      var totalAvailMoney = 0;
      var listTotalResult = [];
      for (let i = 0; i < userList.length; i++)
      {
        totalRealMoney += userList[i].realMoney;
        totalAvailMoney += userList[i].availableMoney;
        var userInfo = {
          email: userList[i].email,
          address: userList[i].address,
          realMoney: userList[i].realMoney,
          availableMoney: userList[i].realMoney - userList[i].availableMoney
        };
        listTotalResult.push(userInfo);
      }
      res.json({success: true,
        totalUser: totalUser,
        totalRealMoney: totalRealMoney,
        totalAvailableMoney: totalRealMoney - totalAvailMoney,
        listTotalResult: listTotalResult});
    }
    });
}
