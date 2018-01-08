var User = require('../models/user');
var Transaction = require('../models/transaction');
var ReferenceOutput = require('../models/referenceOutput');

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

exports.history = function(req, res, next)
{
  var token = getToken(req.headers);
  if (token){
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
        email: decoded.email
    }, function (err, user) {
      var dataSend = [];
      /*Transaction.find({outputs:{$elemMatch:{"ADD" + user.address}}}, function(err, listTran){

      });*/
    });
  }
}
exports.send_money = function (req, res, next) {
  var token = getToken(req.headers);
  var receiveAddress = req.body.address;
  var valueMoney = parseInt(req.body.money);
  if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
          email: decoded.email
      }, function (err, user) {
          if (err) res.json({ success: false, msg: err });

          if (!user) {
              return res.json({ success: false, msg: 'User not found.' });
          }
          else
          {
            if(receiveAddress.length == 64){
            if(user.address == receiveAddress)
            {
              return res.json({ success: false, msg: 'Cannot send money to yourself.' });
            }
            else
            {
              //Kiểm tra unconfirmed transaction


              Transaction.find({state: "unconfirmed"}, function(err, listUnTran){
                for(let i=0;i<listUnTran.length; i++){
                  User.findOne({publicKey: listTran[i].inputs[0].unlockScript}, function(err, userCheck){
                    if(userCheck)
                      {
                        if(userCheck.address == user.address){
                          return res.json({ success: false, msg: 'You cannot create new transaction.' });
                        }
                      }
                  });

                }
              });
              ReferenceOutput.find(function(err, references)
              {
                var referenceUser = [];
                for(let i=0;i<references.length;i++)
                {
                  if(references[i].address == user.address)
                  {
                    referenceUser.push(references[i]);
                    var money = 0;
                    for(let j=0; j<referenceUser.length;j++)
                    {
                      money += referenceUser[j].money;
                    }
                    if(money>=valueMoney){
                      break;
                    }
                  }
                }
                var money = 0;
                for(let i=0; i<referenceUser.length;i++)
                {
                  money += referenceUser[i].money;
                }
                if(money<valueMoney)
                {
                  return res.json({ success: false, msg: 'Do not have enough money!' });
                }
                else
                {
                  SendMessageGoogleAuthenticator(user,valueMoney, receiveAddress, res, req);
                  User.findById(user._id, function(err, result){
                    if(err) throw err;
                    if(result)
                    {
                      let bountyTransaction = {
                        inputs: [],
                        outputs: [],
                        version: 1
                      };
                      let destinations = [result.address, receiveAddress];
                      signTransaction(bountyTransaction, result, destinations, referenceUser, valueMoney, money - valueMoney);

                      console.log(JSON.stringify(bountyTransaction));
                      console.log(bountyTransaction);
                      var newTran = new Transaction();
                      newTran.hash = result._id;
                      newTran.inputs=bountyTransaction.inputs;
                      newTran.outputs=bountyTransaction.outputs;
                      newTran.state="initialized";
                      newTran.auth = result.keyGoogleAuthenticator;
                      newTran.save(function(err){
                        if(err)
                          return res.json({ success: false, msg: 'Cannot save create transaction.'});
                        else{
                          User.findByIdAndUpdate(result._id,{$set:{availableMoney: valueMoney}},{ new: true },function (err){
                            if(err)
                            console.log(err);
                          });
                        }
                      });
                    }
                    else {
                      return res.json({ success: false, msg: 'User not found.' });
                    }
                  });

                }
              });
            }
          }
          else{
            return res.json({ success: false, msg: 'Wrong address.' });
          }
          }
      });
  } else {
      return res.json({ success: false, msg: 'No token provided.' });
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
    //var uriVerify = authenticator.generateTotpUri(key, user.email, "KCoin", 'SHA1', 6, 30);
    /*var user_instance = new User();
    user_instance._id = user._id;
    user_instance.keyGoogleAuthenticator = key;*/
    SendVerifyMail(req, res, formattedKey, user, valueMoney, receiveAddress);
    /*User.findByIdAndUpdate(user._id, {$set:{keyGoogleAuthenticator:key}},{ new: true },function (err) {
        if (err) {
            res.json({ success: false, msg: 'User not found.' });
        }
        else {
            var imgSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + uriVerify;
            SendVerifyMail(req, res, formattedKey, user, imgSrc,valueMoney, receiveAddress);
        }
    });*/
}

SendVerifyMail = function (req, res, key, user, valueMoney, receiveAddress) {

    var host = req.get('host');
    //link này sẽ được thay thế bằng link tới form nhập password mới
    var link = "http://localhost:3000/transactions/verify/" + key;              //link to reset password
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
                  if(verify_value != 0)
                  {
                    var referenceChange = false;
                    for(let i=0; tran.inputs.length; i++)
                    {
                      referenceChange = ReferenceOutput.findOne({referencedOutputHash: tran.inputs[i].referencedOutputHash}, function(err, reference)
                      {
                        if(err){
                          res.json({ success: false, msg: err });
                        }
                        else{
                          if(reference){
                            return false;
                          }
                          else{
                            return true;
                          }
                        }
                      });
                      if(referenceChange == true)
                        break;
                    }
                    if(referenceChange)
                    {
                      User.findOne({keyGoogleAuthenticator: keyGoogleAuthenticator}, function(err, user)
                      {
                        if(err){
                          res.json({ success: false, msg: err });
                        }
                        else {
                          if(user){
                            ReferenceOutput.find(function(err, references)
                            {
                              var referenceUser = [];
                              for(let i=0;i<references.length;i++)
                              {
                                if(references[i].address == user.address)
                                {
                                  referenceUser.push(references[i]);
                                  var money = 0;
                                  for(let j=0; j<referenceUser.length;j++)
                                  {
                                    money += referenceUser[j].money;
                                  }
                                  if(money>=valueMoney){
                                    break;
                                  }
                                }
                              }
                              var money = 0;
                              for(let i=0; i<referenceUser.length;i++)
                              {
                                money += referenceUser[j].money;
                              }
                              if(money<valueMoney)
                              {
                                return res.json({ success: false, msg: 'Do not have enough money.' });
                              }
                              else
                              {
                                let bountyTransaction = {
                                  inputs: [],
                                  outputs: [],
                                  version: 1
                                };
                                let destinations = [tran.outputs[0].lockScript.split(" ")[1], tran.outputs[1].lockScript.split(" ")[1]];
                                signTransaction(bountyTransaction, user, destinations, referenceUser, tran.outputs[1].value, money - tran.outputs[1].value);

                                console.log(JSON.stringify(bountyTransaction));
                                console.log(bountyTransaction);

                                var header, option;
                                header = {
                                  'User-Agent':       'Super Agent/0.0.1',
                                  'Content-Type':     'application/json'
                                }

                                option = {
                                  url: 'https://api.kcoin.club/transactions',
                                  method: 'POST',
                                  headers: header,
                                  body: JSON.stringify(bountyTransaction)
                                }

                                console.log(option);
                                request(option, function (error, response, body) {
                                  if (!error)
                                  {
                                    console.log("Reaspon:" + response);
                                    Transaction.findByIdAndUpdate(tran._id,{$set:{inputs:bountyTransaction.inputs, state:"unconfirmed"}},{ new: true },function (err)
                                    {
                                      if(err)
                                        return res.json({ success: false, msg: 'Cannot update state and inputs transaction.'});
                                    });
                                    console.log("Respone transaction: " + JSON.parse(response.body));
                                    var receiveTran = JSON.parse(response.body);
                                    Transaction.findByIdAndUpdate(tran._id,{$set:{hash: receiveTran.hash}},{ new: true },function (err){
                                      if(err)
                                        res.json({ success: false, msg: "Cannot update hash transaction." });
                                    });
                                    for(let i=0;i<referenceUser.length;i++)
                                    {
                                      ReferenceOutput.findByIdAndRemove(referenceUser[i]._id,function(err){
                                        if(err){
                                          res.json({ success: false, msg: "Cannot delete old ReferenceOutput." });
                                        }
                                      });
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
                                              res.json({ success: false, msg: err });
                                          });
                                        }
                                      });

                                    }
                                    res.json({ success: true, msg: 'Waiting for server to confirm.'});
                                  }
                                  else {
                                    console.log("Error:" + error);
                                    res.json({ success: false, msg: error});
                                  }
                                });
                              }
                            });
                          }
                          else {
                            res.json({ success: false, msg: 'User not found.' });
                          }
                        }
                      });

                    }
                    else {
                      var header, option;
                      header = {
                        'User-Agent':       'Super Agent/0.0.1',
                        'Content-Type':     'application/json'
                      }
                      let bountyTransaction = {
                        inputs: [],
                        outputs: [],
                        version: 1
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
                          lockScript: 'ADD ' + tran.outputs[i].lockScript
                        });
                      }

                      option = {
                        url: 'https://api.kcoin.club/transactions',
                        method: 'POST',
                        headers: header,
                        body: JSON.stringify(tran)
                      }
                      request(option, function (error, response, body) {
                        if (!error)
                        {
                          console.log("Reaspon:" + response);
                          Transaction.findByIdAndUpdate(tran._id,{$set:{state:"unconfirmed"}},{ new: true },function (err)
                          {
                            if(err)
                              return res.json({ success: false, msg: 'Cannot update state transaction.'});
                          });
                          console.log("Respone transaction: " + JSON.parse(response.body));
                          var receiveTran = JSON.parse(response.body);
                          Transaction.findByIdAndUpdate(tran._id,{$set:{hash: receiveTran.hash}},{ new: true },function (err){
                            if(err)
                              res.json({ success: false, msg: "Cannot update hash transaction (in no change reference)." });
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
                                      res.json({ success: false, msg: "Cannot delete old ReferenceOutput (in no change reference)." });
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
                          res.json({ success: false, msg: error});
                        }
                      });
                    }
                  }
                  else
                  {
                    Transaction.findByIdAndRemove(tran._id, function(err){
                      if(err){
                        res.json({ success: false, msg: err });
                      }
                      else {
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
signTransaction = function(bountyTransaction, user, destinations, referenceUser, moneySend, moneyRemain)
{
      let key = {
        privateKey: user.privateKey,
        publicKey: user.publicKey,
        address: user.address
      };
      let referenceOutputsHashes = [];
      for(let i=0;i<referenceUser.length;i++)
      {
        referenceOutputsHashes.push(referenceUser[i].referencedOutputHash);
      }

      let keys = [];
      for(let i=0;i<referenceOutputsHashes.length;i++)
      {
        bountyTransaction.inputs.push({
          referencedOutputHash: referenceOutputsHashes[i],
          referencedOutputIndex: referenceUser[i].referencedOutputIndex,
          unlockScript: ''
        });
        keys.push(key);
      }

      bountyTransaction.outputs.push({
        value: moneyRemain,
        lockScript: 'ADD ' + destinations[0]
      });
      bountyTransaction.outputs.push({
        value: moneySend,
        lockScript: 'ADD ' + destinations[1]
      });
      console.log(JSON.stringify(bountyTransaction));
      console.log(bountyTransaction);
      sign(bountyTransaction, keys);
}
/*sendToTransactionKcoin = function(privateKey, publicKey, address, res)
{
  const HASH_ALGORITHM = 'sha256';
  let destinations = ['768559b0242d7203a1b8c3a0d034841866822c487defc7fa6e359d29c27742f3',
  'a74c89375469ce553872a753ef6e330985eec6f1ada41a9be69c246db1ad08de'];
  let key = {
    privateKey: privateKey,
    publicKey: publicKey,
    address: address
  };
  let referenceOutputsHashes = [
    'd6fd4a290c22190d6c414f51c96a7eb800c1705e83d3931861f562935c1f831c'
  ];
  let bountyTransaction = {
    version: 1,
    inputs: [],
    outputs: []
  };

  let keys = [];
  referenceOutputsHashes.forEach(hash => {
    bountyTransaction.inputs.push({
      referencedOutputHash: hash,
      referencedOutputIndex: 2,
      unlockScript: ''
    });
    keys.push(key);
  });

  bountyTransaction.outputs.push({
    value: 9999,
    lockScript: 'ADD ' + destinations[0]
  });
  bountyTransaction.outputs.push({
    value: 1,
    lockScript: 'ADD ' + destinations[1]
  });

  sign(bountyTransaction, keys);
// Write to file then POST https://api.kcoin.club/transactions
  console.log(JSON.stringify(bountyTransaction));
  var header, option;
  header = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/json'
  }

  option = {
    url: 'https://api.kcoin.club/transactions',
    method: 'POST',
    headers: header,
    body: JSON.stringify(bountyTransaction)
  }

console.log(option);
  request(option, function (error, response, body) {
    if (!error)
    {
      console.log("Reaspon:" + response);
      res.json({ success: true, response: response});
    }
    else {
      console.log("Error:" + error);
      res.json({ success: false, msg: error});
    }
  });
}*/

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
