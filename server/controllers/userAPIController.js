var User = require ('../models/user');
var jwt  = require('jwt-simple');
var config  = require('../config/database');
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
        res.json({success: true, token: token, email: user.email});
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
