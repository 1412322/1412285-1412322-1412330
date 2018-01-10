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
          Transaction.findOneAndRemove({auth: keyGoogleAuthenticator}, function(err){
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
      var dataTranSend = [];
      var dataTranReceive = [];

      async.parallel({
      listBlock: function (callback){
        Block.find({}).sort({}).exec(callback);},
      listTran: function (callback){
        Transaction.find({}).sort({}).exec(callback);},
      listUser: function (callback){
        User.find({}).sort({}).exec(callback);}
       }, function (err,result)
       {
         var listTranUserSend = [];
         var listTranUserReceive=[];
         var listTimeStampSend = [];
         var listTimeStampReceive = [];
         for(let i=0; i<result.listTran.length; i++)
         {
            if(result.listTran[i].inputs[0].unlockScript.indexOf("PUB") != -1)
            {
              if(result.listTran[i].inputs[0].unlockScript.split(" ")[1] == user.publicKey)
              {
                listTranUserSend.push(result.listTran[i]);
              }
              else
              {
                for(let j=0;j<result.listTran[i].outputs.length;j++)
                {
                  if(result.listTran[i].outputs[j].lockScript.split(" ")[1] == user.address)
                  {
                    listTranUserReceive.push(result.listTran[i]);
                  }
                }
              }
            }
            else
            {
              for(let j=0;j<result.listTran[i].outputs.length;j++)
              {
                if(result.listTran[i].outputs[j].lockScript.split(" ")[1] == user.address)
                {
                  listTranUserReceive.push(result.listTran[i]);
                }
              }
            }
         }

         for(let i=0; i< listTranUserSend.length; i++)
         {
           for(let j=0; j<result.listBlock.length; j++)
           {
             for(let k=0; k<result.listBlock[j].transactions.length;k++)
             {
               if(result.listBlock[j].transactions[k] == listTranUserSend[i].hash)
               {
                 var outputs = [];
                 for(let t=0;t<listTranUserSend[i].outputs.length; t++)
                 {
                   outputs.push({
                     address: listTranUserSend[i].outputs[t].lockScript.split(" ")[1],
                     money: listTranUserSend[i].outputs[t].value,
                     index: t
                   });
                 }
                 if(listTranUserSend[i].state == "initialized")
                 {
                   var key = listTranUserSend[i].auth;
                   var formattedKeyArrays = key.split(' ');
                   var formattedKey = '';
                   for (let i = 0; i < formattedKeyArrays.length; i++) {
                       formattedKey += formattedKeyArrays[i].toUpperCase();
                   }
                   listTimeStampSend.push(result.listBlock[j].timestamp);
                   dataTranSend.push({
                     hash: listTranUserSend[i].hash,
                     time: result.listBlock[j].timestamp,
                     outputs: outputs,
                     state: listTranUserSend[i].state,
                     auth: formattedKey
                   });
                 }
                 else{
                   listTimeStampSend.push(result.listBlock[j].timestamp);
                   dataTranSend.push({
                     hash: listTranUserSend[i].hash,
                     time: result.listBlock[j].timestamp,
                     outputs: outputs,
                     state: listTranUserSend[i].state
                   });
                 }

                 break;
               }
             }
           }
         }

         for(let i=0; i< listTranUserReceive.length; i++)
         {
             var money = 0;
             var index = 0;
             for(let j=0;j<listTranUserReceive[i].outputs.length;j++)
             {
               if(listTranUserReceive[i].outputs[j].lockScript.split(" ")[1] == user.address)
               {
                 money = listTranUserReceive[i].outputs[j].value;
                 index = j;
                 break;
               }
             }
             var time = 0;
             for(let j=0; j<result.listBlock.length;j++)
             {
               for(let k=0; k<result.listBlock[j].transactions.length;k++)
               {
                 if(result.listBlock[j].transactions[k] == listTranUserReceive[i].hash)
                 {
                   listTimeStampReceive.push(result.listBlock[j].timestamp);
                   time = result.listBlock[j].timestamp;
                 }
               }
             }
             var sender = null;
           if(listTranUserReceive[i].inputs[0].unlockScript.indexOf("PUB") != -1)
           {

             for(let j=0; j<result.listUser.length; j++)
             {

               if(result.listUser[j].publicKey == listTranUserReceive[i].inputs[0].unlockScript.split(" ")[1])
               {
                 sender = result.listUser[j];
                 break;
               }
             }
             if(sender == null)
             {
               dataTranReceive.push({
                 hash: listTranUserReceive[i].hash,
                 time:time,
                 sender:'unknown',
                 index: index,
                 money:money
               });
             }
             else
             {
               dataTranReceive.push({
                 hash: listTranUserReceive[i].hash,
                 time:time,
                 sender:sender.address,
                 index: index,
                 money:money
               });
             }

           }
           else
           {
             dataTranReceive.push({
               hash: listTranUserReceive[i].hash,
               time:time,
               sender:'Blockchain',
               index: index,
               money:money
             });
           }
         }



         for(let i=0; i<listTimeStampSend.length;i++)
         {
           for(let j=i+1; j<listTimeStampSend.length-1;j++)
           {
             var datei = new Date(listTimeStampSend[i] * 1000);
             var datej = new Date(listTimeStampSend[j] * 1000);
             if(datej.getTime() > datei.getTime())
             {
               var t = listTimeStampSend[i];
               listTimeStampSend[i]=listTimeStampSend[j];
               listTimeStampSend[j]=t;
             }

           }
         }

         for(let i=0; i<listTimeStampReceive.length;i++)
         {
           for(let j=i+1; j<listTimeStampReceive.length-1;j++)
           {
             var datei = new Date(listTimeStampReceive[i] * 1000);
             var datej = new Date(listTimeStampReceive[j] * 1000);
             if(datej.getTime() > datei.getTime())
             {
               var t = listTimeStampReceive[i];
               listTimeStampReceive[i]=listTimeStampReceive[j];
               listTimeStampReceive[j]=t;
             }

           }
         }

         var dataSortSend = [];
         var dataSortReceive = [];

         for(let i=0; i<listTimeStampSend.length;i++)
         {
           for(let j=0; j<dataTranSend.length;j++)
           {
             if(dataTranSend[j].time == listTimeStampSend[i])
             {
               dataSortSend.push(dataTranSend[j]);
               break;
             }
           }
         }

         for(let i=0; i<listTimeStampReceive.length;i++)
         {
           for(let j=0; j<dataTranReceive.length;j++)
           {
             if(dataTranReceive[j].time == listTimeStampReceive[i])
             {
               dataSortReceive.push(dataTranReceive[j]);
               break;
             }
           }
         }
         res.json({
           success: true,
           listTranSend: dataSortSend,
           listTranReceive: dataSortReceive
         });
       });
     }

});
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

      Transaction.find({state: 'unconfirmed'}, function(err, unTrans){
        if(err){
          return res.json({ success: false, msg: 'Cannot save create transaction.'+ err});
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
                  if (money >= sendMoney)
                  {
                    break;
                  }
                }
                console.log("Money: " + money);
                console.log("Money send: " + sendMoney);
                if (money < sendMoney)
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
                  check = true;
                }
                if(check)
                {
                  listAvailRefer.push(listRefeUser[i]);
                  check = false;
                }
              }

              /////////////////////////
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
                    if (money >= sendMoney)
                    {
                      break;
                    }
                  }
                  if (money < sendMoney)
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

              ////////////////////////
            });
          }
        }
      });


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
                Transaction.findOne({
                    auth: keyGoogleAuthenticator
                }, function (err, tran) {
                    if (err) {
                        res.json({ success: false, msg: err });
                    }

                    if (!tran) {
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

                                  for(let i=0;i<tran.inputs.length;i++)
                                  {
                                    bountyTransaction.inputs.push({
                                      referencedOutputHash: tran.inputs[i].referencedOutputHash,
                                      referencedOutputIndex: tran.inputs[i].referencedOutputIndex,
                                      unlockScript: tran.inputs[i].unlockScript
                                    });
                                  }
                                  for(let i=0;i<tran.outputs.length;i++)
                                  {
                                    bountyTransaction.outputs.push({
                                      value: tran.outputs[i].value,
                                      lockScript: tran.outputs[i].lockScript
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
                                      Transaction.findByIdAndUpdate(tran._id,{$set:{state:"unconfirmed"}},{ new: true },function (err)
                                      {
                                        if(err)
                                          return res.json({ success: false, msg: 'Cannot update state transaction.'});
                                      });
                                      console.log("Respone transaction: " + response.body);
                                      var receiveTran = JSON.parse(response.body);
                                      Transaction.findByIdAndUpdate(tran._id,{$set:{hash: receiveTran.hash}},{ new: true },function (err){
                                        if(err)
                                          res.json({ success: false, msg: "Cannot update hash transaction." });
                                      });

                                      for(let j=0;j<tran.inputs.length; j++)
                                      {
                                        if(tran.inputs[j].unlockScript.indexOf("PUB") != -1)
                                        {
                                          User.findOne({publicKey: (tran.inputs[j].unlockScript).split(" ")[1]}, function (err, user)
                                          {
                                            if(user){
                                              ReferenceOutput.findOneAndRemove({referencedOutputHash:tran.inputs[j].referencedOutputHash, address: user.address},function(err){
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
                                      res.json({ success: false, msg: response});
                                    }
                                  });
                              }
                              else
                              {
                                Transaction.findByIdAndRemove(tran._id, function(err){
                                  if(err){
                                    res.json({ success: false, msg: err });
                                  }
                                  else {
                                    User.findByIdAndUpdate(user._id, {$set:{availableMoney: user.availableMoney - tran.outputs[1].value}},{ new: true },function (err){
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
