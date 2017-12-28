var User = require ('../models/user');
var jwt  = require('jwt-simple');
var config  = require('../config/database');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    secureConnection: false,
    auth: {
        user: '1412285.1412322.1412330.group@gmail.com',
        pass: 'kcoin1234'
    }
}));

exports.signup = function (req,res,next) {
  if (!req.body.email || !req.body.password) {
      res.json({success: false, msg: 'Please pass email and password.'});
    } else {
      var newUser = new User();
	    newUser.email = req.body.email;
      newUser.password = newUser.encryptPassword(req.body.password);

      // save the user
      newUser.save(function(err, user) {
        if (err) {
          return res.json({success: false, msg: 'Email already exists.'});
        }
        var token = jwt.encode(user, config.secret);
        /*var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: '1412285.1412322.1412330.group@gmail.com',
              pass: 'kcoin1234'
            }
          });*/

          SendVerificationMail(req,user);
          res.json({success: true, token: token, email: user.email, msg: 'A verification email has been sent to ' + user.email + '.'});

            /*var mailOptions = {
              to: user.email,
              subject: 'Account Verification Token',
              text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token + '.\n'
            };
            transporter.sendMail(mailOptions, function (errSendMail) {
                if (err) {
                  res.json({success: false, msg: errSendMail.message});
                }
                res.json({success: true, token: token, email: user.email, msg: 'A verification email has been sent to ' + user.email + '.'});
            });*/
        /*var token = jwt.encode(user, config.secret);
        res.json({success: true, token: token, email: user.email});*/
      });
    }
}

exports.signin = function (req,res,next) {
  console.log("req:", req.body.email);
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    console.log('email signin: ', req.body.email);
    if (err) throw err;

    if (!user) {
        console.log('User not found', req.body.email);
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      if (!user.validPassword(req.body.password)){
			     res.send({success: false, msg: 'Authentication failed. Wrong password.'});
		  }
      else{
        if (!user.isVerified)
         return res.json({ success: false, type: 'not-verified', msg: 'Your account has not been verified.' });

        // if user is found and password is right create a token
        var token = jwt.encode(user, config.secret);
        // return the information including token as JSON
        res.json({success: true, token: token, email: user.email});
      }

    }
  });
}

exports.profile = function (req,res,next) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      email: decoded.email
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!', email:  user.email, token: token});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
}

exports.verify_email = function (req,res,next) {
  console.log(req.protocol+":/"+req.get('host'));
    User.findById(req.params.id).exec(function (err,user) {
        if(err){
            console.log(err);
            res.json({success: false, msg: err});

        }
        else
        {
            if (user != null && user !=undefined)
            {
                if (user.isVerified == true){
                    res.json({success: false, msg: 'Email ' + user.email + 'was verified!'});
                }
            }
            else
            {
                res.json({success: false, msg: 'User not found!'});
            }
        }
    });
    var user_instance = new User();
    user_instance._id = req.params.id;
    user_instance.isVerified = true;
    User.findByIdAndUpdate(req.params.id,user_instance,{}).exec(function (err,user) {
        if (err){
            res.json({success: false, msg: 'User not found!'});
        }
        else{
            var noti = "Your email "+user.email+" is verified";
            res.json({success: false, msg: noti});
        }
    });
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

SendVerificationMail = function (req,user) {
    var host=req.get('host');
    var link="http://"+req.get('host')+"/api/users/verify/"+user["_id"];
    var mailOptions={
        to : user["email"],
        subject : "Please confirm your account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    transport.sendMail((mailOptions),function(error, response){
        if(error){
            console.log(error);
            //res.end("error");
           // return false;
        }
        else{
            console.log("Message sent: " + response.message);
            console.log("success");
            //res.end("sent");
            //return true;
        }
    });
};
