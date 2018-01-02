var User = require('../models/user');

var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
var ursa = require('ursa');
var bigInt = require('big-integer');
const HASH_ALGORITHM = 'sha256';


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
          } else {
              sendToTransactionKcoin(user.privateKey, user.publicKey, user.address, res);
              /*res.json({ success: true, msg: 'Welcome to KCoin Application, ' + user.email + '!',
              email: user.email,
              token: token,
              address: user.address,
              realMoney: user.realMoney,
              availableMoney: user.realMoney - user.availableMoney
            });*/
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

sendToTransactionKcoin = function(privateKey, publicKey, address, res)
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
