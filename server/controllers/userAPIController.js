var User = require('../models/user');
var jwt = require('jwt-simple');
var config = require('../config/database');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
const rp = require('request-promise');
const ursa = require('ursa');
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

    // save the user
    newUser.save(function (err, user) {
        if (err) {
            return res.json({ success: false, msg: 'Email address already exists.' });
        }
        var token = jwt.encode(user, config.secret);
        createAddress(res, user);

        SendVerificationMail(req, user);
        res.json({ success: true, msg: 'A verification email has been sent to ' + user.email + '.' });

    });

}

exports.signin = function (req, res, next) {
    console.log("req:", req.body.email);
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

                // if user is found and password is right create a token
                var token = jwt.encode(user, config.secret);
                // return the information including token as JSON
                res.json({ success: true, token: token, email: user.email });
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
                res.json({ success: true, msg: 'Welcome to KCoin Application, ' + user.email + '!',
                email: user.email,
                token: token,
                address: user.address,
                realMoney: user.realMoney,
                availableMoney: user.realMoney - user.availableMoney
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
                getTotalBlock(res, user, false);
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

exports.forget_password = function (req, res, next) {
    var email = req.body.email;
    User.findOne({ 'email': email }).exec(function (err, user) {
        if (err) {
            res.json({ success: false, msg: err });
        }
        if (user != null && user != undefined) {
            var noti = "Request has been sent to " + email + '.';
            SendResetPasswordMail(req, user, res);                        //Send email reset password
            // res.json({success: true, msg: noti});

        }
        else {
            res.json({ success: false, msg: "User not found." });
        }
    });
}

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

SendVerificationMail = function (req, user) {
    var host = req.get('host');
    var link = "http://" + req.get('host') + "/api/users/verify/" + user["_id"];
    var mailOptions = {
        to: user["email"],
        subject: "Kcoin Account Email Verification",
        html: "Hi from 1412285-1412322-1412330 Team,<br>Email verification is required in order to effectively use your KCoin Account.<br><a href=" + link + ">Click here</a> to complete your email verification.<br>If you did not create a KCoin Account and received this email, please DO NOT click the link."
    }
    console.log(mailOptions);
    transport.sendMail((mailOptions), function (error, response) {
        if (error) {
            console.log(error);
            //res.end("error");
            // return false;
        }
        else {
            console.log("Message sent: " + response.message);
            console.log("success");
            //res.end("sent");
            //return true;
        }
    });
};

SendResetPasswordMail = function (req, user, res) {
    var token = bcrypt.hashSync(user["_id"], bcrypt.genSaltSync(5), null);
    User.findByIdAndUpdate(user["_id"], { _id: user["_id"], passwordResetToken: token }).exec(function (err, user) {
        if (err) {
            res.json({ success: false, msg: err });
        }
        // var noti = "Request has been sent to " + user.email + '.';
        // res.json({ success: true, msg: noti });
    });


    var host = req.get('host');
    //link này sẽ được thay thế bằng link tới form nhập password mới
    var link = "http://localhost:3000/resetpassword/" + user["_id"] + "?reset=" + token;              //link to reset password
    var mailOptions = {
        to: user["email"],
        subject: "Reset your password",
        html: "Hello,<br> Please Click on the link to reset your password.<br><a href=" + link + ">Click here to reset your password</a>"
    }
    console.log(mailOptions);
    transport.sendMail(mailOptions, function (error, response) {
        if (error) {
            res.json({ success: false, msg: "Reset token does not exists!" });
        }
        else {
            console.log("Message sent: " + response.message);
            res.json({ success: true, resetToken: token, userID: user["_id"] });
        }
    });
};

var isLimit = false;
createAddress =  function (res, user)
{
isLimit = false;
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
    console.log('address - createAddress - JSON: ', JSON.parse(body).address);
    user.address = JSON.parse(body).address;
    user.publicKey = JSON.parse(body).publicKey;
    user.privateKey = JSON.parse(body).privateKey;
    var user_instance = new User();
    user_instance._id = user._id;
    //user_instance.address = JSON.parse(body).address;
    user_instance.address = '77d231e59c95d3c4bad46c4896964427649f77321c38b59642d2ad4c022e3cb5';
    user_instance.publicKey = JSON.parse(body).publicKey;
    user_instance.privateKey = JSON.parse(body).privateKey;
    User.findByIdAndUpdate(user._id,user_instance,{}).exec(function (err, newUser) {
        if (err){
            res.json({success: false, msg: 'Create address error!'});
        }
        //getRealMoney(res, newUser, -1);
        var URLs = [];
        var options = [];
        console.log('user.address createAddress: ', newUser);
        getTotalBlock(res, user_instance, true);
        getUnconfirmedMoney(user_instance);
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
 getRealMoney =  function (option, user, isSignup, res, i, totalBlock){
    return rp(option)
    .then(function(data){
      console.log('apicall-promise: ', data);
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
      console.log('response header 1: ', response.headers);
      var headerRes = response.headers;
      var totalBlock = headerRes['x-total-count'];
      console.log('totalBlock: ', totalBlock);
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
                     }*/
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
}

exports.create_transaction = function (req, res, next) {

    let privateKeyHex = '2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d0a4d4949435777494241414b42675143714c424153657763544372674c696941637a644333335a645148754374706d6d51792f7831672b434337674d566b3070610a5a5a7646544152526139655a746162565169776b3843454a47573379326c5a785348555967785a7052574462652f71774a5268354965554b2b426254554c36610a3537796e6d57776c756e7831554f775168773278597a6838387a395378587a565439687274666b3439304a4f6e566e5852376f6456776b4975774944415141420a416f4741495131483364384a59376873514d6d474c5449496650334d47754b306275586f6b5267646f394747644d65337a36503543412b2b4c7062794b384a500a634f706f53666c3953337463583045534b7434666467644676726a4f68686c486e486947306a39426e33352b377274714b2b2b793654724747494f69694868630a537737576e31666b4a305a3447756950782f346d3973464431614f354d57537a76386451465559762f36763245574543515144653258494e3061646c614978590a56446e4a4b636a6941417335576a373979535547623672483937577245616253314e334364535950774638455538724e7556467a4a71655a2f624f4474314f730a304141506c4b6478416b45417733795063674a6f554b725350765a75534e725a54452f4b636e43724d7a446966646b614635766f6f6641573668786e323554710a456c79773537486d37535379445554527554487577314764464c36744869615536774a414b4541454471546f5a444f4f3763464173716d2b5937743453344b570a55415a4e6a71304b6e70574b46587a5a73636a4b7950325a7730794f6e4e7835693944462b6c4e6f41444e4867696e526a69762f5a74454673514a414e30576d0a77564f5137773339654450784a73524b494675484943686648354134326542696b6a3551336b696d4566654b48666e533350493853715a775a71697a647a44340a4932624d33596a62347875756b7848526c514a414e784a6f784a445773524158376b56654d475177777164346b56515177414c3070556a493071744144506e460a585a3078342f4a6b3273764557417a55513658514436784f39566556656b69736932434b5136797274513d3d0a2d2d2d2d2d454e44205253412050524956415445204b45592d2d2d2d2d0a';
    
    let privateKey = ursa.createPrivateKey(Buffer.from(privateKeyHex, 'hex'));
    let signer = ursa.createSigner(HASH_ALGORITHM);
    let sign = signer.sign(privateKey, 'hex');
  console.log(sign);
  var newTransaction = {
    inputs:[
      {
        unlockScript:'PUB 2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d4947664d413047435371475349623344514542415155414134474e4144434269514b42675143714c424153657763544372674c696941637a644333335a64510a48754374706d6d51792f7831672b434337674d566b3070615a5a7646544152526139655a746162565169776b3843454a47573379326c5a785348555967785a700a52574462652f71774a5268354965554b2b426254554c36613537796e6d57776c756e7831554f775168773278597a6838387a395378587a565439687274666b340a39304a4f6e566e5852376f6456776b4975774944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d0a SIG '+sign.toString(),
        referencedOutputHash:'6d97526dc919784ffabefd21adfffe56ab2384e43e41b085a54f5fd39ee6654c',
        referencedOutputIndex:15
      }
    ],
    outputs:[
      {
        value:9999,
        lockScript:'ADD a74c89375469ce553872a753ef6e330985eec6f1ada41a9be69c246db1ad08de'
      },
      {
        value:1,
        lockScript:'ADD 768559b0242d7203a1b8c3a0d034841866822c487defc7fa6e359d29c27742f3'
      }
    ],
    version:1
  }

  var header, option;
  header = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/json'
  }

  option = {
    url: 'https://api.kcoin.club/transactions',
    method: 'POST',
    headers: header,
    body: JSON.stringify(newTransaction)
  }

console.log(option);
  /*request(option, function (error, response, body) {
    if (!error)
    {
      console.log("Reaspon:" + response);
    }
    else {
      console.log("Error:" + error);
    }
  });*/
}

