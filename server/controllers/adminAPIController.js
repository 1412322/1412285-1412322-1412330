const Nexmo = require('nexmo');
var TMClient = require('textmagic-rest-client');
var authenticator = require('authenticator');
var User = require('../models/user');
var Block = require('../models/block');
var Transaction = require('../models/transaction');

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

exports.get_transaction_info = function (req, res, next) {
  var token = getToken(req.headers);
  if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
          email: decoded.email
      }, function (err, user) {
          if (err) throw err;

          if (!user) {
              res.json({ success: false, msg: 'User Not Found!', statusCode: 404 });
          } else {
            if (user.role == 'admin')
            {
              getBlocks(res);
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

getBlocks = function(res)
{
  Block.find(function(err,blockList){
    if (err)
    {
      res.json({ success: false, msg: 'Get Blocks Failed!', error: err });
    }
    if (!blockList) {
      res.json({ success: false, msg: 'Block is empty!' });
    } else {
      Transaction.find(function(err2,transList){
        if (err2)
        {
          res.json({ success: false, msg: 'Get Transactions Failed!', error: err2 });
        }
        if (!transList) {
          res.json({ success: false, msg: 'Transaction is empty!' });
        } else {
          var listResult = [];
          for (let i = 0; i < blockList.length; i++)
          {
            var time = blockList[i].timestamp;
            var date = new Date(time * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var day = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
            var formattedDate = day + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            for (let j = 0; j < blockList[i].transactions.length; j++)
            {
              for (let k = 0; k < transList.length; k++)
              {
                if (transList[k].hash == blockList[i].transactions[j])
                {
                  var transDetail = transList[k];
                  var inputs = [];
                  for (let l = 0; l < transDetail.inputs.length; l++)
                  {
                    var unlockScript = transDetail.inputs[l].unlockScript.split(' ');
                    if (unlockScript[0] == 'PUB' && unlockScript[2] == 'SIG')
                    {
                      var input =
                      {
                        referencedOutputHash: transDetail.inputs[l].referencedOutputHash,
                        referencedOutputIndex: transDetail.inputs[l].referencedOutputIndex
                      };
                      inputs.push(input);
                    }
                  }
                  if (inputs.length > 0)
                  {
                    var outputs = [];
                    for (let l = 0; l < transDetail.outputs.length; l++)
                    {
                      var lockScript = transDetail.outputs[l].lockScript.split(' ');
                      var output =
                      {
                        value: transDetail.outputs[l].value,
                        address: lockScript[1],
                        index: l
                      };
                      outputs.push(output);
                    }
                    var transInfo = {
                      hash: transList[k].hash,
                      time: formattedDate,
                      state: transList[k].state,
                      inputs: inputs,//tham chiếu output index
                      outputs: outputs
                    };
                    listResult.push(transInfo);
                  }

                }
              }
            }

          }
          res.json({success: true,
            listResult: listResult });
        }
      });
    }
    });
}
