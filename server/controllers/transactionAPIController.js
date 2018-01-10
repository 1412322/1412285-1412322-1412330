var User = require('../models/user');
var Transaction = require('../models/transaction');
var ReferenceOutput = require('../models/referenceOutput');
var Block = require('../models/block');

var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
var ursa = require('ursa');
var bigInt = require('big-integer');
var authenticator = require('authenticator');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
const HASH_ALGORITHM = 'sha256';

var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    secureConnection: false,
    auth: {
        user: '1412285.1412322.1412330.group@gmail.com',
        pass: 'kcoin1234'
    }
}));

exports.delete_initialized_transaction = function(req, res, next)
{
  var token = getToken(req.headers);
  var keyGoogleAuthenticatorFormatted = req.params.key;
  var keyGoogleAuthenticator = '';
  for (let i = 0; i < keyGoogleAuthenticatorFormatted.length; i++) {
      if (i % 4 == 0 && i > 0 && i < keyGoogleAuthenticatorFormatted.length)
          keyGoogleAuthenticator += ' ' + keyGoogleAuthenticatorFormatted[i].toLowerCase();
      else
          keyGoogleAuthenticator += keyGoogleAuthenticatorFormatted[i].toLowerCase();;
  }

  if (token)
  {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
          email: decoded.email
      }, function (err, user)
      {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({ success: false, msg: 'User not found.' });
        }
        else
        {
          Transaction.findOneAndRemove({auth: keyGoogleAuthenticator, state: 'initialized'}, function(err){
            if(err){
              res.json({ success: false, msg: err });
            }
              else {
                res.json({ success: true, msg: 'Delete initialized transaction successfully.' });
              }
          });
        }
      });
  }
  else {
    return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
}


exports.history = function(req, res, next)
{
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
            Transaction.find(function(err,tranList){
              if (err)
              {
                res.json({ success: false, msg: 'Find Transaction failed!', err: err});
              }
              else
              {
                if (tranList.length == 0 || !tranList)
                {
                  res.json({ success: false, msg: 'Transaction is empty!'});
                }
                else
                {
                  Block.find(function(err,blockList){
                    if (err)
                    {
                      res.json({ success: false, msg: 'Find Block failed!', err: err});
                    }
                    else
                    {
                      if (blockList.length == 0 || !blockList)
                      {
                        res.json({ success: false, msg: 'Block is empty!'});
                      }
                      else
                      {
                        var listTranSend = [];
                        var listTranReceive = [];
                        for (let i = 0; i < blockList.length; i++)
                        {
                          var timestamp = blockList[i].timestamp;
                          var transactions = blockList[i].transactions;
                          for (let j = 0; j < transactions.length; j++)
                          {
                            for (let k = 0; k < tranList.length; k ++)
                            {
                              if (transactions[j] == tranList[k].hash)
                              {
                                var sender = tranList[k].outputs[0].lockScript.split(' ');
                                if (sender[1] == user.address)//user là người gửi
                                {
                                  var outputs = [];
                                  for (let l = 0; l < tranList[k].outputs.length; l++)
                                  {
                                    var lockScript = tranList[k].outputs[l].lockScript.split(' ');
                                    outputs.push({
                                      address: lockScript[1],
                                      money: tranList[k].outputs[l].value,
                                      index: l
                                    });
                                  }
                                  var senderInfo =
                                  {
                                    hash: tranList[k].hash,
                                    time: timestamp,
                                    state: tranList[k].state,
                                    outputs: outputs
                                  };
                                  listTranSend.push(senderInfo);
                                }
                                else//ko phải người gửi
                                {
                                  for (let l = 0; l < tranList[k].outputs.length; l++)
                                  {
                                    var lockScript = tranList[k].outputs[l].lockScript.split(' ');
                                    if (lockScript[1] == user.address)//người nhận
                                    {
                                      var sender = tranList[k].outputs[0].lockScript.split(' ');
                                      var receiverInfo =
                                      {
                                        hash: tranList[k].hash,
                                        time: timestamp,
                                        sender: sender[1],
                                        index: l,
                                        money: tranList[k].outputs[l].value
                                      };
                                      listTranReceive.push(receiverInfo);
                                    }
                                  }
                                }
                              }//đã confirm thì có trong block và hash

                            }
                          }
                        }

                        for (let i = 0; i < tranList.length; i++)
                        {
                          if (tranList[i].state == 'initialized')//khởi tạo
                          {
                            if (tranList[i].hash == user._id)//người gửi là bạn, đang khởi tạo
                            {
                              var outputs = [];
                              for (let l = 0; l < tranList[i].outputs.length; l++)
                              {
                                var lockScript = tranList[i].outputs[l].lockScript.split(' ');
                                outputs.push({
                                  address: lockScript[1],
                                  money: tranList[i].outputs[l].value,
                                  index: l
                                });
                              }
                              var senderInfo =
                              {
                                hash: tranList[i].hash,
                                time: null,
                                state: tranList[i].state,
                                outputs: outputs
                              };
                              listTranSend.push(senderInfo);
                            }
                          }
                          if (tranList[i].state == 'unconfirmed')
                          {
                            var sender = tranList[i].outputs[0].lockScript.split(' ');
                            if (sender[1] == user.address)//người gửi là bạn, đang khởi tạo
                            {
                              var outputs = [];
                              for (let l = 0; l < tranList[i].outputs.length; l++)
                              {
                                var lockScript = tranList[i].outputs[l].lockScript.split(' ');
                                outputs.push({
                                  address: lockScript[1],
                                  money: tranList[i].outputs[l].value,
                                  index: l
                                });
                              }
                              var senderInfo =
                              {
                                hash: tranList[i].hash,
                                time: null,
                                state: tranList[i].state,
                                outputs: outputs
                              };
                              listTranSend.push(senderInfo);
                            }
                          }

                        }
                        //sort ngày
                        for(let i = 0; i < listTranSend.length - 1; i++)
                        {
                          for(let j = i + 1; j < listTranSend.length; j++)
                          {
                            var timeNull = false;
                            if (listTranSend[i].time != null && listTranSend[j].time != null)
                            {
                              var datei = new Date(listTranSend[i].time * 1000);
                              var datej = new Date(listTranSend[j].time * 1000);

                              if(datej.getTime() > datei.getTime())
                              {
                                var t = listTranSend[i];
                                listTranSend[i]=listTranSend[j];
                                listTranSend[j]=t;
                              }
                            }


                          }
                        }

                        for(let i = 0; i < listTranReceive.length; i++)
                        {
                          for(let j = i + 1; j < listTranReceive.length - 1; j++)
                          {
                            var datei = new Date(listTranReceive[i].time * 1000);
                            var datej = new Date(listTranReceive[j].time * 1000);
                            if(datej.getTime() > datei.getTime())
                            {
                              var t = listTranReceive[i];
                              listTranReceive[i] = listTranReceive[j];
                              listTranReceive[j] = t;
                            }

                          }
                        }
                        res.json({ success: true,
                        listTranSend: listTranSend,
                        listTranReceive: listTranReceive
                      });
                      }
                    }
                  });
                }
              }
            });
          }
      });
  } else {
      return res.status(403).send({ success: false, msg: 'No token provided.' });
  }


}
exports.send_money = function (req, res, next) {
  var token = getToken(req.headers);
  if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
          email: decoded.email
      }, function (err, user) {
          if (err) throw err;

          if (!user) {
              return res.status(403).send({ success: false, msg: 'User not found.' });
          }
          else
          {
              sendToTransactionKcoin(user, user.privateKey, user.publicKey, user.address, res, req);
          }
      });
  } else {
      return res.status(403).send({ success: false, msg: 'No token provided.' });
  }

}

sendToTransactionKcoin = function(user, privateKey, publicKey, address, res, req)
{
  const HASH_ALGORITHM = 'sha256';
  if(req.body.destination.length == 64)
  {
    if(address == req.body.destination)
    {
      return res.json({ success: false, msg: 'Cannot send money to yourself.' });
    }
    else
    {
      Transaction.find({state: "initialized", hash: user._id}, function(err, inTrans){
        if(err){
          return res.json({ success: false, msg: "initialized"+err});
        }
        else {
          if(inTrans.length != 0)
          {
            return res.json({ success: false, msg: "Cannot create transaction! You need to verify your last transaction"});
          }
          else{
            Transaction.find({state: 'unconfirmed'}, function(err, unTrans){
              if(err){
                return res.json({ success: false, msg: err});
              }
              else {
                if(unTrans.length == 0)
                {
                  console.log("!unTran");
                  var sendMoney = req.body.sendMoney;
                  let destinations = [
                    address,
                    req.body.destination
                  ];
                  let key = {
                    privateKey: privateKey,
                    publicKey: publicKey,
                    address: address
                  };
                  console.log('sendMoney: ', sendMoney);
                  console.log('destinations: ', destinations);
                  console.log('key: ', key);
                  ReferenceOutput.find({ address: address }, function(err,referenceList){
                    if (err)
                    {
                      return res.json({ success: false, msg: 'Get Reference Output Failed!', error: err });
                    }
                    if (!referenceList) {
                      return res.json({ success: false, msg: 'Reference Output Not Found!' });
                    }
                    else
                    {
                      var money  = 0;
                      let referenceOutputs = [];
                      console.log('referenceList.length: ', referenceList.length);
                      console.log('referenceList ', referenceList);
                      for (let i = 0; i < referenceList.length; i++)
                      {
                        money += referenceList[i].money;
                        console.log('referenceList[i].money: ', referenceList[i].money);
                        console.log('money: ', money);
                        var referenceOutput =
                        {
                          referencedOutputHash: referenceList[i].referencedOutputHash,
                          referencedOutputIndex: referenceList[i].referencedOutputIndex
                        };
                        referenceOutputs.push(referenceOutput);
                        if (money > sendMoney)
                        {
                          break;
                        }
                      }
                      console.log("Money: " + money);
                      console.log("Money send: " + sendMoney);
                      if (money <= sendMoney)
                      {
                        res.json({ success: false, msg: 'Do not have enough money to send!' });
                      }
                      else
                      {

                        let bountyTransaction = {
                          version: 1,
                          inputs: [],
                          outputs: []
                        };
                        let keys = [];
                        referenceOutputs.forEach(referenceOutput => {
                          bountyTransaction.inputs.push({
                            referencedOutputHash: referenceOutput.referencedOutputHash,
                            referencedOutputIndex: referenceOutput.referencedOutputIndex,
                            unlockScript: ''
                          });
                          keys.push(key);
                        });
                        bountyTransaction.outputs.push({
                          value: money - sendMoney,
                          lockScript: 'ADD ' + destinations[0]
                        });
                        bountyTransaction.outputs.push({
                          value: sendMoney,
                          lockScript: 'ADD ' + destinations[1]
                        });
                        sign(bountyTransaction, keys);
                        console.log(JSON.stringify(bountyTransaction));
                        //console.log(option);
                        var newTran = new Transaction();
                        newTran.hash = user._id;
                        newTran.inputs=bountyTransaction.inputs;
                        newTran.outputs=bountyTransaction.outputs;
                        newTran.state="initialized";
                        newTran.auth = user.keyGoogleAuthenticator;
                        newTran.save(function(err){
                          if(err)
                            return res.json({ success: false, msg: 'Cannot save create transaction.'+ err});
                          else{
                            User.findByIdAndUpdate(user._id,{$set:{availableMoney: sendMoney}},{ new: true },function (err){
                              if(err)
                              return res.json({ success: false, msg: 'Cannot update availableMoney.'});
                              else {
                                SendMessageGoogleAuthenticator(user, req.body.sendMoney, req.body.destination, res, req);
                              }
                            });
                          }
                        });
                      }
                    }
                  });
                }
                else
                {
                  console.log("unTran");
                  ReferenceOutput.find({address: address}, function(err, listRefeUser){
                    var check = false;
                    var listReferUntran=[];
                    var listAvailRefer = [];
                    for(let i=0; i<unTrans.length;i++)
                    {
                      for(let j=0;j<unTrans[i].inputs.length;j++)
                      {
                        listReferUntran.push({
                          publicKey: unTrans[i].inputs[j].unlockScript.split(" ")[1],
                          referencedOutputHash: unTrans[i].inputs[j].referencedOutputHash,
                          referencedOutputIndex: unTrans[i].inputs[j].referencedOutputIndex
                        });
                      }
                    }

                    for(let i=0;i<listRefeUser.length;i++)
                    {
                      for(let j=0; j<listReferUntran.length;j++)
                      {
                        if(listRefeUser[i].referencedOutputHash != listReferUntran[j].referencedOutputHash
                        && listRefeUser[i].referencedOutputIndex != listReferUntran[j].referencedOutputIndex
                      && publicKey != listReferUntran[j].publicKey)
              				{
              					check = true;
              					break;
              				}
                      }
                      if(check)
                      {
                        listAvailRefer.push(listRefeUser[i]);
                        check = false;
                      }
                    }

                    /////////////////////////
      			  if(listAvailRefer.length==0)
                {
                  return res.json({ success: false, msg: 'Cannot create transaction! You need to wait for your last transaction confirmed' });
              }
              else{
                    var sendMoney = req.body.sendMoney;
                    let destinations = [
                      address,
                      req.body.destination
                    ];
                    let key = {
                      privateKey: privateKey,
                      publicKey: publicKey,
                      address: address
                    };
                    console.log('sendMoney: ', sendMoney);
                    console.log('destinations: ', destinations);
                    console.log('key: ', key);
                        var money  = 0;
                        let referenceOutputs = [];
                        console.log('referenceList.length: ', listAvailRefer.length);
                        for (let i = 0; i < listAvailRefer.length; i++)
                        {
                          money += listAvailRefer[i].money;
                          console.log('referenceList[i].money: ', listAvailRefer[i].money);
                          console.log('money: ', money);
                          var referenceOutput =
                          {
                            referencedOutputHash: listAvailRefer[i].referencedOutputHash,
                            referencedOutputIndex: listAvailRefer[i].referencedOutputIndex
                          };
                          referenceOutputs.push(referenceOutput);
                          if (money > sendMoney)
                          {
                            break;
                          }
                        }
                        if (money <= sendMoney)
                        {
                          return res.json({ success: false, msg: 'Do not have enough money to send!' });
                        }
                        else
                        {

                          let bountyTransaction = {
                            version: 1,
                            inputs: [],
                            outputs: []
                          };
                          let keys = [];
                          referenceOutputs.forEach(referenceOutput => {
                            bountyTransaction.inputs.push({
                              referencedOutputHash: referenceOutput.referencedOutputHash,
                              referencedOutputIndex: referenceOutput.referencedOutputIndex,
                              unlockScript: ''
                            });
                            keys.push(key);
                          });
                          bountyTransaction.outputs.push({
                            value: money - sendMoney,
                            lockScript: 'ADD ' + destinations[0]
                          });
                          bountyTransaction.outputs.push({
                            value: sendMoney,
                            lockScript: 'ADD ' + destinations[1]
                          });
                          sign(bountyTransaction, keys);
                          console.log(JSON.stringify(bountyTransaction));
                          //console.log(option);
                          var newTran = new Transaction();
                          newTran.hash = user._id;
                          newTran.inputs=bountyTransaction.inputs;
                          newTran.outputs=bountyTransaction.outputs;
                          newTran.state="initialized";
                          newTran.auth = user.keyGoogleAuthenticator;
                          newTran.save(function(err){
                            if(err)
                              return res.json({ success: false, msg: 'Cannot save create transaction.'+ err});
                            else{
                              User.findByIdAndUpdate(user._id,{$set:{availableMoney: sendMoney}},{ new: true },function (err){
                                if(err)
                                return res.json({ success: false, msg: 'Cannot update availableMoney.'});
                                else {
                                  SendMessageGoogleAuthenticator(user, req.body.sendMoney, req.body.destination, res, req);
                                }
                              });
                            }
                          });
                        }
                      }
                    ////////////////////////
                  });
                }
              }
            });
          }
        }
      });
      /**/


    }
  }
  else {
    res.json({ success: false, msg: 'Wrong address!' });
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


SendMessageGoogleAuthenticator= function (user, valueMoney, receiveAddress, res, req) {
    var key = user.keyGoogleAuthenticator;
    var formattedKeyArrays = key.split(' ');
    var formattedKey = '';
    for (let i = 0; i < formattedKeyArrays.length; i++) {
        formattedKey += formattedKeyArrays[i].toUpperCase();
    }
    SendVerifyMail(req, res, formattedKey, user, valueMoney, receiveAddress);
}

SendVerifyMail = function (req, res, key, user, valueMoney, receiveAddress) {

    var host = req.get('host');
    var link = "http://localhost:3000/transactions/verify/" + key;
    var mailOptions = {
        to: user["email"],
        subject: "Verify Transaction",
        html: "Do you want to send "+valueMoney+" coin to address: "+ receiveAddress +"?<br> Please Click on the link to verify your new transaction!<br><a href=" + link + ">Click here to verify your new transaction</a>"
    }
    console.log('mailOptions: ', mailOptions);
    transport.sendMail(mailOptions, function (error, response) {
        if (error) {
            res.json({ success: false, msg: "Verify account failed.", error: error });
        }
        else {
            res.json({
                success: true,
                msg: 'A verify link has been sent to your email.',
                keyGoogleAuthenticator: key
            });
        }
    });
};


exports.verify_google_authenticator = function (req, res, next) {
    var token = getToken(req.headers);
    var keyGoogleAuthenticatorFormatted = req.params.key;
    var verifyToken = req.body.verifyToken;
    var verify_value = req.body.verifyValue;
    var keyGoogleAuthenticator = '';
    for (let i = 0; i < keyGoogleAuthenticatorFormatted.length; i++) {
        if (i % 4 == 0 && i > 0 && i < keyGoogleAuthenticatorFormatted.length)
            keyGoogleAuthenticator += ' ' + keyGoogleAuthenticatorFormatted[i].toLowerCase();
        else
            keyGoogleAuthenticator += keyGoogleAuthenticatorFormatted[i].toLowerCase();;
    }
    console.log("keyGoogleAuthenticator: " + keyGoogleAuthenticator);
    if (token)
    {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function (err, user)
        {
          if (err) res.json({ success: false, msg: err });

          if (!user) {
              return res.json({ success: false, msg: 'User not found.' });
          }
          else
          {
            User.findOne({keyGoogleAuthenticator: keyGoogleAuthenticator}, function(err, userCheck)
            {
              if (err)
                res.json({ success: false, msg: err });
              if(user.address != userCheck.address)
              {
                return res.json({ success: false, msg: 'User not found.' });
              }
              else
              {
                Transaction.find({
                    auth: keyGoogleAuthenticator
                }, function (err, trans) {
                    if (err) {
                        res.json({ success: false, msg: err });
                    }

                    if (!trans || trans.length == 0) {
                        //console.log('User not found.', req.body.email);
                        res.json({ success: false, msg: 'Transaction not found.' });
                    } else {
                        var result = authenticator.verifyToken(keyGoogleAuthenticator, verifyToken);
                        if (result != null) {
                            if (result.delta == 0) {
                              if(verify_value == true)
                              {
                                  var header, option;
                                  header = {
                                    'User-Agent':       'Super Agent/0.0.1',
                                    'Content-Type':     'application/json'
                                  }
                                  let bountyTransaction = {
                                    version: 1,
                                    inputs: [],
                                    outputs: []
                                  };
                                  var lengthTran = trans.length;
                                  for(let i=0;i<trans[lengthTran - 1].inputs.length;i++)
                                  {
                                    bountyTransaction.inputs.push({
                                      referencedOutputHash: trans[lengthTran - 1].inputs[i].referencedOutputHash,
                                      referencedOutputIndex: trans[lengthTran - 1].inputs[i].referencedOutputIndex,
                                      unlockScript: trans[lengthTran - 1].inputs[i].unlockScript
                                    });
                                  }
                                  for(let i=0;i<trans[lengthTran - 1].outputs.length;i++)
                                  {
                                    bountyTransaction.outputs.push({
                                      value: trans[lengthTran - 1].outputs[i].value,
                                      lockScript: trans[lengthTran - 1].outputs[i].lockScript
                                    });
                                  }

                                  option = {
                                    url: 'https://api.kcoin.club/transactions',
                                    method: 'POST',
                                    headers: header,
                                    body: JSON.stringify(bountyTransaction)
                                  }

                                  console.log("bountyTransaction:"+JSON.stringify(bountyTransaction));
                                  console.log("Option2" + JSON.stringify(option));

                                  request(option, function (error, response, body) {
                                    if (response.statusCode == 200)
                                    {
                                      console.log("Reaspon:" + JSON.stringify(response));
                                      Transaction.findByIdAndUpdate(trans[lengthTran - 1]._id,{$set:{state:"unconfirmed"}},{ new: true },function (err)
                                      {
                                        if(err)
                                          return res.json({ success: false, msg: 'Cannot update state transaction.'});
                                      });
                                      console.log("Respone transaction: " + response.body);
                                      var receiveTran = JSON.parse(response.body);
                                      Transaction.findByIdAndUpdate(trans[lengthTran - 1]._id,{$set:{hash: receiveTran.hash}},{ new: true },function (err){
                                        if(err)
                                          res.json({ success: false, msg: "Cannot update hash transaction." });
                                      });

                                      for(let j=0;j<trans[lengthTran - 1].inputs.length; j++)
                                      {
                                        if(trans[lengthTran - 1].inputs[j].unlockScript.indexOf("PUB") != -1)
                                        {
                                          User.findOne({publicKey: (trans[lengthTran - 1].inputs[j].unlockScript).split(" ")[1]}, function (err, user)
                                          {
                                            if(user){
                                              ReferenceOutput.findOneAndRemove({referencedOutputHash:trans[lengthTran - 1].inputs[j].referencedOutputHash, address: user.address},function(err){
                                                if(err)
                                                  res.json({ success: false, msg: "Cannot delete old ReferenceOutput." });
                                              });
                                            }
                                          });
                                        }

                                      }

                                      for(let j=0;j<receiveTran.outputs.length; j++)
                                      {
                                        User.findOne({address: receiveTran.outputs[j].lockScript.split(" ")[1]}, function(err, user){
                                          if(err) res.json({ success: false, msg: err });
                                          if(user)
                                          {
                                            var newReference = new ReferenceOutput();
                                            newReference.referencedOutputHash = receiveTran.hash;
                                            newReference.referencedOutputIndex = j;
                                            newReference.address = receiveTran.outputs[j].lockScript.split(" ")[1];
                                            newReference.money = receiveTran.outputs[j].value;
                                            newReference.save(function(err){
                                              if(err)
                                                console.log(err);
                                            });
                                          }
                                        });

                                      }
                                      res.json({ success: true, msg: 'Waiting for server to confirm.'});
                                    }
                                    else {
                                      console.log("Error:" + error);
                                      res.json({ success: false, msg: response.body});
                                    }
                                  });
                              }
                              else
                              {
                                var lengthTran = trans.length;
                                Transaction.findByIdAndRemove(trans[lengthTran - 1]._id, function(err){
                                  if(err){
                                    res.json({ success: false, msg: err });
                                  }
                                  else {
                                    User.findByIdAndUpdate(user._id, {$set:{availableMoney: user.availableMoney - trans[lengthTran - 1].outputs[1].value}},{ new: true },function (err){
                                      if(err)
                                        res.json({ success: false, msg: err });
                                    });
                                    res.json({ success: false, msg: 'Transaction has been deleted.' });
                                  }
                                });
                              }

                            }
                            else {
                                res.json({ success: false, msg: 'Verify Token is expired.' });
                            }
                        }
                        else {
                            res.json({ success: false, msg: 'Wrong Verify Token.', result: result });
                        }


                    }
                });
              }
            });
          }
        });
    }
}



toBinary = function (transaction, withoutUnlockScript) {
  let version = Buffer.alloc(4);
  version.writeUInt32BE(transaction.version);
  let inputCount = Buffer.alloc(4);
  inputCount.writeUInt32BE(transaction.inputs.length);
  let inputs = Buffer.concat(transaction.inputs.map(input => {
    // Output transaction hash
    let outputHash = Buffer.from(input.referencedOutputHash, 'hex');
    // Output transaction index
    let outputIndex = Buffer.alloc(4);
    // Signed may be -1
    outputIndex.writeInt32BE(input.referencedOutputIndex);
    let unlockScriptLength = Buffer.alloc(4);
    // For signing
    if (!withoutUnlockScript) {
      // Script length
      unlockScriptLength.writeUInt32BE(input.unlockScript.length);
      // Script
      let unlockScript = Buffer.from(input.unlockScript, 'binary');
      return Buffer.concat([ outputHash, outputIndex, unlockScriptLength, unlockScript ]);
    }
    // 0 input
    unlockScriptLength.writeUInt32BE(0);
    return Buffer.concat([ outputHash, outputIndex, unlockScriptLength]);
  }));
  let outputCount = Buffer.alloc(4);
  outputCount.writeUInt32BE(transaction.outputs.length);
  let outputs = Buffer.concat(transaction.outputs.map(output => {
    // Output value
    let value = Buffer.alloc(4);
    value.writeUInt32BE(output.value);
    // Script length
    let lockScriptLength = Buffer.alloc(4);
    lockScriptLength.writeUInt32BE(output.lockScript.length);
    // Script
    let lockScript = Buffer.from(output.lockScript);
    return Buffer.concat([value, lockScriptLength, lockScript ]);
  }));
  return Buffer.concat([ version, inputCount, inputs, outputCount, outputs ]);
}

signUtils = function (message, privateKeyHex) {
  // Create private key form hex
  let privateKey = ursa.createPrivateKey(Buffer.from(privateKeyHex, 'hex'));
  // Create signer
  let signer = ursa.createSigner(HASH_ALGORITHM);
  // Push message to verifier
  signer.update(message);
  // Sign
  return signer.sign(privateKey, 'hex');
}

  //transactions.sign(bountyTransaction, keys);
sign = function (bountyTransaction, keys) {
  let message = toBinary(bountyTransaction, true);
  bountyTransaction.inputs.forEach((input, index) => {
    let key = keys[index];
    let signature = signUtils(message, key.privateKey);
    // Genereate unlock script
    input.unlockScript = 'PUB ' + key.publicKey + ' SIG ' + signature;
  });
}
