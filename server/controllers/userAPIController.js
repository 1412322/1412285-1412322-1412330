var User = require('../models/user');
var ReferenceOutput = require('../models/referenceOutput');
var jwt = require('jwt-simple');
var config = require('../config/database');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
var authenticator = require('authenticator');

//const ursa = require('ursa');
const HASH_ALGORITHM = 'sha256';

var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    secureConnection: false,
    auth: {
        user: '1412285.1412322.1412330.group@gmail.com',
        pass: 'kcoin1234'
    }
}));

exports.signup = function (req, res, next) {

    var newUser = new User();
    newUser.email = req.body.email;
    newUser.password = newUser.encryptPassword(req.body.password);
    newUser.role = 'user';
    // save the user
    newUser.save(function (err, user) {
        if (err) {
            return res.json({ success: false, msg: 'Email address already exists.' });
        }
        var token = jwt.encode(user, config.secret);
        createAddress(res, user);
        createAddressWithdraw(res, user);
        //SendVerificationMail(req, user);
        //res.json({ success: true, msg: 'A verification email has been sent to ' + user.email + '.' });
        SendMessageGoogleAuthenticatorFirstTime(user, res, req);

    });

}

exports.verify_google_authenticator_register = function (req, res, next) {
    var keyGoogleAuthenticatorFormatted = req.params.key;
    var verifyToken = req.body.verifyToken;
    var keyGoogleAuthenticator = '';
    for (let i = 0; i < keyGoogleAuthenticatorFormatted.length; i++) {
        if (i % 4 == 0 && i > 0 && i < keyGoogleAuthenticatorFormatted.length)
            keyGoogleAuthenticator += ' ' + keyGoogleAuthenticatorFormatted[i].toLowerCase();
        else
            keyGoogleAuthenticator += keyGoogleAuthenticatorFormatted[i].toLowerCase();;
    }
    User.findOne({
        keyGoogleAuthenticator: keyGoogleAuthenticator
    }, function (err, user) {
        if (err) {
            res.json({ success: false, msg: err });
        }

        if (!user) {
            console.log('User not found.', req.body.email);
            res.json({ success: false, msg: 'User not found.' });
        } else {
            var result = authenticator.verifyToken(keyGoogleAuthenticator, verifyToken);
            if (result != null) {
                if (result.delta == 0) {
                    var user_instance = new User();
                    user_instance._id = user._id;
                    user_instance.isVerified = true;
                    User.findByIdAndUpdate(user._id, { isVerified: true }).exec(function (err, user) {
                        if (err) {
                            res.json({ success: false, msg: 'User not found.' });
                        }
                        else {
                            res.json({ success: true, msg: 'Account is verified.', email: user.email });
                        }
                    });
                    //res.json({ success: true, msg: 'Account is verified.', email: user.email });
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

exports.get_qr_code = function (req, res, next) {
    var keyGoogleAuthenticatorFormatted = req.params.key;
    var keyGoogleAuthenticator = '';
    for (let i = 0; i < keyGoogleAuthenticatorFormatted.length; i++) {
        if (i % 4 == 0 && i > 0 && i < keyGoogleAuthenticatorFormatted.length)
            keyGoogleAuthenticator += ' ' + keyGoogleAuthenticatorFormatted[i].toLowerCase();
        else
            keyGoogleAuthenticator += keyGoogleAuthenticatorFormatted[i].toLowerCase();;
    }
    User.findOne({
        keyGoogleAuthenticator: keyGoogleAuthenticator
    }, function (err, user) {
        if (err) {
            res.json({ success: false, msg: err });
        }

        if (!user) {
            console.log('User not found.', req.body.email);
            res.json({ success: false, msg: 'User not found.' });
        } else {
            //var result = authenticator.verifyToken(keyGoogleAuthenticator, verifyToken);
            var uriVerify = authenticator.generateTotpUri(keyGoogleAuthenticator, user.email, "KCoin", 'SHA1', 6, 30);
            var imgSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + uriVerify;
            res.json({ success: true, msg: 'Get QR Code successfully!', qrCode: imgSrc });

        }
    });

}

exports.signin = function (req, res, next) {
    console.log("req:", req.body.email);
    var verifyToken = req.body.verifyToken;
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        console.log('email signin: ', req.body.email);
        if (err) throw err;

        if (!user) {
            console.log('User not found.', req.body.email);
            res.send({ success: false, msg: 'User not found.' });
        } else {
            // check if password matches
            if (!user.validPassword(req.body.password)) {
                res.send({ success: false, msg: 'Wrong password.' });
            }
            else {
                if (!user.isVerified)
                    return res.json({ success: false, type: 'not-verified', msg: 'Your account has not been verified.' });
                var result = authenticator.verifyToken(user.keyGoogleAuthenticator, verifyToken);
                if (result != null) {
                    if (result.delta == 0)//xác thực đúng code
                    {
                        // if user is found and password is right create a token
                        var token = jwt.encode(user, config.secret);
                        // return the information including token as JSON
                        res.json({ success: true, token: token, email: user.email, role: user.role });
                    }
                    else {
                        res.json({ success: false, msg: 'Verify Token is expired.' });
                    }
                }
                else {
                    res.json({ success: false, msg: 'Wrong Verify Token.' });
                }

            }

        }
    });
}

exports.profile = function (req, res, next) {
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
              ReferenceOutput.find({ 'address': user.address }, function(err2,referenceList){
                if (err2)
                {
                  res.json({success: false, msg: err2});
                }
                else
                {
                  if (!referenceList || referenceList.length == 0)
                  {
                    res.json({
                        success: true, msg: 'Welcome to KCoin Application, ' + user.email + '!',
                        email: user.email,
                        role: user.role,
                        token: token,
                        address: user.address,
                        realMoney: user.realMoney,
                        availableMoney: user.realMoney - user.availableMoney
                    });
                  }
                  else
                  {
                    var realMoney = 0;
                    for (let i = 0; i < referenceList.length; i++)
                    {
                      realMoney += referenceList[i].money;
                    }
                    User.findByIdAndUpdate( user._id, { realMoney: realMoney }).exec(function (err, user) {
                        if (err) {
                            res.json({ success: false, msg: 'User not found.' });
                        }
                    });
                    res.json({
                        success: true, msg: 'Welcome to KCoin Application, ' + user.email + '!',
                        email: user.email,
                        role: user.role,
                        token: token,
                        address: user.address,
                        realMoney: realMoney,
                        availableMoney: user.realMoney - user.availableMoney
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

exports.get_real_money = function (req, res, next) {
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
                //getTotalBlock(res, user, false);
            }
        });
    } else {
        return res.status(403).send({ success: false, msg: 'No token provided.' });
    }
}

exports.verify_email = function (req, res, next) {
    console.log(req.protocol + ":/" + req.get('host'));
    User.findById(req.params.id).exec(function (err, user) {
        if (err) {
            console.log(err);
            res.json({ success: false, msg: err });

        }
        else {
            if (user != null && user != undefined) {
                if (user.isVerified == true) {
                    res.json({ success: false, msg: 'Email ' + user.email + 'was verified!' });
                }
            }
            else {
                res.json({ success: false, msg: 'User not found.' });
            }
        }
    });
    var user_instance = new User();
    user_instance._id = req.params.id;
    user_instance.isVerified = true;
    User.findByIdAndUpdate(req.params.id, user_instance, {}).exec(function (err, user) {
        if (err) {
            res.json({ success: false, msg: 'User not found.' });
        }
        else {
            var noti = "Your email " + user.email + " is verified";
            res.json({ success: true, msg: noti });
        }
    });
}

exports.reset_password = function (req, res, next) {
    var email = req.body.email;
    var verifyToken = req.body.verifyToken;
    var newPassword = req.body.password;
    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            res.json({ success: false, msg: err });
        }

        if (!user) {
            res.json({ success: false, msg: 'User not found.' });
        } else {
            var result = authenticator.verifyToken(user.keyGoogleAuthenticator, verifyToken);
            if (result != null) {
                if (result.delta == 0) {

                    User.findByIdAndUpdate(user._id,
                        { password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(5), null) })
                        .exec(function (err, user) {
                            if (err) {
                                res.json({ success: false, msg: 'Reset password failed!' });
                            }
                            else {
                                res.json({ success: true, msg: 'Reset password successed!' });
                            }
                        });
                    //res.json({ success: true, msg: 'Account is verified.', email: user.email });
                }
                else {
                    res.json({ success: false, msg: 'Verify Token is expired.' });
                }
            }
            else {
                res.json({ success: false, msg: 'Wrong Verify Token.'});
            }


        }
    });
}
/*
exports.reset_password = function (req, res, next) {
    var reset_qr = req.body.reset;
    var id = req.params.id;
    console.log("id: " + id);
    console.log("Reset: " + reset_qr);

    var messages = [];
    if (reset_qr != null && reset_qr != undefined && reset_qr != '')             //check reset toke param
    {
        User.findById(id).exec(function (err, user) {                           //find user
            if (err) {
                console.log(err);
                res.json({ success: false, msg: err });
            }
            else {
                if (user != null && user != undefined) {
                    console.log("Reset token: " + user.passwordResetToken);
                    if (user.passwordResetToken == reset_qr) {

                        var user_instance = new User();
                        user_instance._id = id;
                        user_instance.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(5), null);
                        user_instance.passwordResetToken = '';
                        user_instance.isVerified = true;
                        User.findByIdAndUpdate(id, user_instance, {}).exec(function (err, user) {
                            console.log(user);
                            if (user != null && user != undefined) {
                                res.json({ success: true, msg: 'Reset password successed.' });
                            }
                            else {
                                res.json({ success: false, msg: 'Reset password failed.' });
                            }
                        });

                    }
                    else {
                        res.json({ success: false, msg: 'Link is expired.' });
                    }
                }
            }

        });
    }
    else {
        res.json({ success: false, msg: "Reset token does not exists." });
    }
}*/
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


//var isLimit = false;
createAddress =  function (res, user)
{
//isLimit = false;
  var headers, options;
  headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
  }

  // Configure the request
  options = {
    url: 'https://api.kcoin.club/generate-address',
    method: 'GET',
    headers: headers
  }

  // Start the request
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    //  res.json(JSON.parse(body));
    /*console.log('address - createAddress - JSON: ', JSON.parse(body).address);
    user.address = JSON.parse(body).address;
    user.publicKey = JSON.parse(body).publicKey;
    user.privateKey = JSON.parse(body).privateKey;*/
    var user_instance = new User();
    user_instance._id = user._id;
    //user_instance.address = JSON.parse(body).address;
    user_instance.address = JSON.parse(body).address;
    user_instance.publicKey = JSON.parse(body).publicKey;
    user_instance.privateKey = JSON.parse(body).privateKey;
    User.findByIdAndUpdate(user._id,user_instance,{}).exec(function (err, newUser) {
        if (err){
            res.json({success: false, msg: 'Create address error!'});
        }
        //getRealMoney(res, newUser, -1);
        /*var URLs = [];
        var options = [];
        console.log('user.address createAddress: ', newUser);
        getTotalBlock(res, user_instance, true);
        getUnconfirmedMoney(user_instance);*/
        //let i = 0;
        /*for (let i = 1050; i < 1070; i++)
        {
          console.log('isLimit: ', isLimit);
          URLs.push('https://api.kcoin.club/blocks/' + i);
          var option = {
            url: 'https://api.kcoin.club/blocks/' + i,
            method: 'GET',
            headers: headers,
            json: true
          };
          options.push(option);
          i++;
          apicall(option, newUser);
        }*/

    });
    } else {
    }
  });
}
createAddressWithdraw = function(res, user){
    var headers, options;
    headers = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/x-www-form-urlencoded'
    }

    // Configure the request
    options = {
      url: 'https://api.kcoin.club/generate-address',
      method: 'GET',
      headers: headers
    }

    // Start the request
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      //  res.json(JSON.parse(body));
      /*console.log('address - createAddress - JSON: ', JSON.parse(body).address);
      user.address = JSON.parse(body).address;
      user.publicKey = JSON.parse(body).publicKey;
      user.privateKey = JSON.parse(body).privateKey;*/
      /*var user_instance = new User();
      user_instance._id = user._id;
      //user_instance.address = JSON.parse(body).address;
      user_instance.address = JSON.parse(body).address;
      user_instance.publicKey = JSON.parse(body).publicKey;
      user_instance.privateKey = JSON.parse(body).privateKey;*/
      User.findByIdAndUpdate(user._id,{$set:{addressWithdraw: JSON.parse(body).address, privateKeyWithdraw:JSON.parse(body).privateKey,publicKeyWithdraw:JSON.parse(body).publicKey }},{ new: true },function (err) {
          if (err){
              res.json({success: false, msg: 'Create address error!'});
          }
          //getRealMoney(res, newUser, -1);
          /*var URLs = [];
          var options = [];
          console.log('user.address createAddress: ', newUser);
          getTotalBlock(res, user_instance, true);
          getUnconfirmedMoney(user_instance);*/
          //let i = 0;
          /*for (let i = 1050; i < 1070; i++)
          {
            console.log('isLimit: ', isLimit);
            URLs.push('https://api.kcoin.club/blocks/' + i);
            var option = {
              url: 'https://api.kcoin.club/blocks/' + i,
              method: 'GET',
              headers: headers,
              json: true
            };
            options.push(option);
            i++;
            apicall(option, newUser);
          }*/

      });
      } else {
      }
    });
  }
   /*getRealMoney =  function (option, user, isSignup, res, i, totalBlock){
      return rp(option)
      .then(function(data){
        //console.log('apicall-promise: ', data);
        if (data.code)
        {
          if (data.code == 'MethodNotAllowed')
          {
            isLimit = true;
          }
        }
        else
        {
          var transactions = data.transactions;
          for (let j = 0; j < transactions.length; j ++)
          {
            var outputs = transactions[j].outputs;
            //console.log('outputs: ',outputs );
            for (let k = 0; k < outputs.length; k++)
            {
              var lockScript = outputs[k].lockScript.split(" ")[1];
            //console.log('lockScript: ',lockScript );
            //  console.log('user.address: ',user.address );
              if (lockScript == user.address)
              {
              //  console.log('user.address: ',user.address );
                User.findById(user._id, function(err, userFindById) {
                  if (err) throw err;

                  if (!userFindById) {
                    //  console.log('User not found.');
                  } else {

                    var user_instance = new User();
                    user_instance._id = userFindById._id;
                    user_instance.realMoney = userFindById.realMoney + outputs[k].value;
                    User.findByIdAndUpdate(userFindById._id,user_instance,{}).exec(function (err,userUpdate) {
                        if (err){
                            //res.json({success: false, msg: 'Update RealMoney error!'});
                        }
                        if (i == totalBlock - 1 && isSignup == false)
                        {
                          res.json({success: true, realMoney: user_instance.realMoney});
                        }
                    });
                  }
                });


              }
              else{
                if (i == totalBlock - 1 && isSignup == false)
                {

                  User.findById(user._id, function(err, userFindById) {
                    if (err) throw err;

                    if (!userFindById) {
                        console.log('User not found.');
                    } else {
                      res.json({success: true, realMoney: userFindById.realMoney});
                    }
                  });
                }
              }

            }
          }
        }
      })
      .catch(function (err) {
          isLimit = true;
      });
  }


  getTotalBlock =  function (res, user, isSignup)
  {

  console.log('getTotalBlock - user.address', user.address);
    var headersTotal, optionsTotal;
    headersTotal = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/x-www-form-urlencoded'
    }

    optionsTotal = {
      url: 'https://api.kcoin.club/blocks',
      method: 'GET',
      headers: headersTotal
    }
  console.log('options', optionsTotal);
    // Start the request
    request(optionsTotal, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      //console.log('response header 1: ', response.headers);
        var headerRes = response.headers;
        var totalBlock = headerRes['x-total-count'];
        //console.log('totalBlock: ', totalBlock);
        var options = [];
        for (let i = 0; i < totalBlock; i++)
        {
          var headers = {
            'User-Agent':       'Super Agent/0.0.1',
            'Content-Type':     'application/x-www-form-urlencoded'
          }
          var option = {
            url: 'https://api.kcoin.club/blocks/' + i,
            method: 'GET',
            headers: headers,
            json: true
          };
          options.push(option);
          getRealMoney(option, user, isSignup, res, i, totalBlock);
        }

      } else {
        console.log(error);
        callback(error);
      }
    });
    // Configure the request

  }

  getUnconfirmedMoney =  function (user){
    var headers, options;
    headers = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/x-www-form-urlencoded'
    }

    options = {
      url: 'https://api.kcoin.club/unconfirmed-transactions',
      method: 'GET',
      headers: headers,
      json: true
    };
     return rp(options)
     .then(function(data){
       console.log('getUnconfirmedMoney: ', data);

         var transactions = data;
         for (let j = 0; j < transactions.length; j ++)
         {
           var outputs = transactions[j].outputs;
           //console.log('outputs: ',outputs );
           for (let k = 0; k < outputs.length; k++)
           {
             var lockScript = outputs[k].lockScript.split(" ")[1];
             console.log('lockScript: ',lockScript );
             console.log('user.address: ',user.address );
             if (lockScript == user.address)
             {
               console.log('user.address: ',user.address );
               User.findById(user._id, function(err, userFindById) {
                 if (err) throw err;

                 if (!userFindById) {
                     console.log('User not found.');
                 } else {

                   var user_instance = new User();
                   user_instance._id = userFindById._id;
                   user_instance.availableMoney = userFindById.availableMoney + outputs[k].value;
                   User.findByIdAndUpdate(userFindById._id,user_instance,{}).exec(function (err,userUpdate) {
                       if (err){
                           //res.json({success: false, msg: 'Update RealMoney error!'});
                       }
                      /* if (i == totalBlock - 1 && isSignup == false)
                       {
                         res.json({success: true, realMoney: user_instance.realMoney});
                       }
                   });
                 }
               });


             }
             else{
               if (i == totalBlock - 1 && isSignup == false)
               {

                 User.findById(user._id, function(err, userFindById) {
                   if (err) throw err;

                   if (!userFindById) {
                       console.log('User not found.');
                   } else {
                     res.json({success: true, realMoney: userFindById.realMoney});
                   }
                 });
               }
             }

           }
         }
     })
     .catch(function (err) {
         isLimit = true;
     });
  }*/


SendMessageGoogleAuthenticatorFirstTime = function (user, res, req) {
    var key = authenticator.generateKey();
    var formattedKeyArrays = key.split(' ');
    var formattedKey = '';
    for (let i = 0; i < formattedKeyArrays.length; i++) {
        formattedKey += formattedKeyArrays[i].toUpperCase();
    }
    var uriVerify = authenticator.generateTotpUri(key, user.email, "KCoin", 'SHA1', 6, 30);
    var user_instance = new User();
    user_instance._id = user._id;
    user_instance.keyGoogleAuthenticator = key;
    User.findByIdAndUpdate(user._id, user_instance, {}).exec(function (err, user) {
        if (err) {
            res.json({ success: false, msg: 'User not found.' });
        }
        else {
            var imgSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + uriVerify;
            SendVerifyMailRegister(req, res, formattedKey, user, imgSrc);
            /*res.json({ success: true,
              msg: 'A verify key has been sent to Your Google Authenticator',
              keyGoogleAuthenticator: formattedKey,
              qrCode: imgSrc });*/
        }
    });
}

SendVerifyMailRegister = function (req, res, key, user, imgSrc) {


    var host = req.get('host');
    //link này sẽ được thay thế bằng link tới form nhập password mới
    var link = "http://localhost:3000/verify/" + key;              //link to reset password
    var mailOptions = {
        to: user["email"],
        subject: "Verify Account",
        html: "Hello,<br> Please Click on the link to verify your account.<br><a href=" + link + ">Click here to verify your account</a>"
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
                keyGoogleAuthenticator: key,
                qrCode: imgSrc
            });
        }
    });
};
