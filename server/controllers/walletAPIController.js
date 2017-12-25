var Wallet = require ('../models/wallet');
var jwt  = require('jwt-simple');
var config  = require('../config/database');
exports.create = function (req,res,next) {
	console.log('create wallet');
	var wallet = Wallet({
	email: req.body.email,
	money: req.body.money
	});
	wallet.save(function(err, result) {
	  if (err) throw err;

	  console.log('Wallet created!');
	  res.json(result);
	});
}

exports.get_wallet_info = function (req,res,next) {
	console.log('wallet info');

	var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    Wallet.findOne({
      email: decoded.email
    }, function(err, wallet) {
        if (err) throw err;

        if (!wallet) {
          return res.status(403).send({success: false, msg: 'Wallet not found.'});
        } else {
          res.json({success: true, wallet: wallet});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

}

exports.update_wallet = function (req,res,next) {
	var wallet = {
	email: req.body.email,
	money: req.body.money
	};
	Wallet.findByIdAndUpdate(req.body.id,wallet,{}).exec(function (err,result) {
            if(err){
                //messages.push(err);
                console.log(err);
            }

            res.json(result);


        });
}

exports.get_wallet_info_by_email = function (req,res,next) {
	console.log('wallet update');

	var token = getToken(req.headers);
  if (token) {
    Wallet.findOne({
      email: req.body.email
    }, function(err, wallet) {
        if (err) throw err;

        if (!wallet) {
          return res.status(403).send({success: false, msg: 'Wallet not found.'});
        } else {
          res.json({success: true, wallet: wallet});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

}

exports.get_wallet_info_by_id = function (req,res,next) {
	console.log('wallet update');

	var token = getToken(req.headers);
  if (token) {
		Wallet.findById(req.params.id,function(err,wallet){
			if (err) throw err;

			if (!wallet) {
				return res.status(403).send({success: false, msg: 'Wallet not found.'});
			} else {
				res.json({success: true, wallet: wallet});
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
