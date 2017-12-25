var Exchange = require ('../models/exchange');
var Wallet = require ('../models/wallet');

var jwt  = require('jwt-simple');
var config  = require('../config/database');
exports.create = function (req,res,next) {
	console.log('create exchange');
	console.log('send:', req.body.send);
	console.log('receive:', req.body.receive);
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    var exchange = Exchange({
      send: req.body.send,
  	  receive: req.body.receive,
  	  money: req.body.money
  	});
    exchange.save(function(err, result) {
  	  if (err) throw err;

  	  console.log('exchange created!');
  	  res.json(result);
  	});
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

}


exports.get_list_send_by_user = function (req,res,next) {
	console.log('list exchange');
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log('decode id: ', decoded._id);
		Exchange.find({
      send: req.params.id
    }).exec(function(err,exchanges) {
        if (err) throw err;
				console.log('exchanges length', exchanges.length);
        if (!exchanges) {
          return res.status(403).send({success: false, msg: 'Wallet not found.'});
        } else {
          res.json({success: true, exchanges: exchanges});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

}

exports.get_list_receive_by_user = function (req,res,next) {
	console.log('list exchange');
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log('decode id: ', decoded._id);
		Exchange.find({
      receive: req.params.id
    }).exec(function(err,exchanges) {
        if (err) throw err;
				console.log('exchanges length', exchanges.length);
        if (!exchanges) {
          return res.status(403).send({success: false, msg: 'Wallet not found.'});
        } else {
          res.json({success: true, exchanges: exchanges});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

}

exports.get_list = function (req,res,next) {
	console.log('list exchange');
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log('decode id: ', decoded._id);
		Exchange.find(function(err,exchanges){
			if (err) throw err;
			if (!exchanges) {
				return res.status(403).send({success: false, msg: 'Exchange not found.'});
			} else {
				res.json({success: true, exchanges: exchanges});
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
