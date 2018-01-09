var User = require('../models/user');
var ReferenceOutput = require('../models/referenceOutput');
var Block = require('../models/block');

var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
var ursa = require('ursa');
var bigInt = require('big-integer');
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
      var output = "ADD" + user.address;
      Transaction.find({outputs:{$elemMatch:{output}}}, function(err, listTran){
        for(let i=0;i<listTran.length;i++){
          if(listTran[i].inputs[0].unlockScript.indexOf("PUB") != -1)
          {
            if(listTran[i].inputs[0].unlockScript.split(" ")[1] == user.publicKey)
            {
                Block.find({transactions: {$in:[listTran[i].hash]}}, function(err, block){
                  var ouputs = [];
                  var outputIndex=0;
                  for(let j=0;j<listTran[i].outputs.length;j++)
                  {
                    if(listTran[i].outputs[j].lockScript.split(" ")[1] != user.address)
                    {
                        outputs.push({
                        address: listTran[i].outputs[j].lockScript.split(" ")[1],
                        money: listTran[i].outputs[j].value,
                        index: j
                      });
                    }
                    else{
                      outputIndex = j;
                    }
                  }
                  dataSend.push({
                    type:'send',
                    time: block[0].timestamp,
                    transactionsHash: listTran[i].hash,
                    outputs: outputs,
                    outputIndex: outputIndex,
                    state: listTran[i].state
                  });
                });
            }
          }
        }
      });
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

      /*Transaction.find({state: "unconfirmed"}, function(err, listUnTran){
        for(let i=0;i<listUnTran.length; i++){
          User.findOne({publicKey: listUnTran[i].inputs[0].unlockScript}, function(err, userCheck){
            if(userCheck)
              {
                if(userCheck.address == user.address){
                  checkUntran = true;
                }
              }

          });
        }

      });*/
      async.parallel({
  		listUnTran: function (callback) {
  			Transaction.find({}).sort({state:"unconfirmed"}).exec(callback);
          },
  		userCheck: function (callback) {
  			User.findOne({}).sort({publicKey: listUnTran[i].inputs[0].unlockScript.split(" ")[1]}).exec(callback);
          }
  	   }, function (err,results) {
         var checkUntran =false;
         for(let i=0;i<results.listUnTran.length; i++)
         {
           if(userCheck)
             {
               if(results.userCheck.address == user.address){
                 checkUntran = true;
               }
             }
         }

         if(checkUntran)
         {
           return res.json({ success: false, msg: 'You cannot create new transaction.' });
         }
         else
         {

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
           ReferenceOutput.find({ 'address': address }, function(err,referenceList){
             if (err)
             {
               res.json({ success: false, msg: 'Get Reference Output Failed!', error: err });
             }
             if (!referenceList) {
               res.json({ success: false, msg: 'Reference Output Not Found!' });
             }
             else
             {
               var money  = 0;
               let referenceOutputs = [];
               console.log('referenceList.length: ', referenceList.length);
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

sendToTransactionKcoin = function(privateKey, publicKey, address, res, req)
{
  const HASH_ALGORITHM = 'sha256';
  //let destinations = req.body.destinations;
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
  ReferenceOutput.find({ 'address': address }, function(err,referenceList){
    if (err)
    {
      res.json({ success: false, msg: 'Get Reference Output Failed!', error: err });
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
