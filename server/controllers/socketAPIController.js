var User = require('../models/user');
var jwt = require('jwt-simple');
var config = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var WebSocket = require('ws');
const rp = require('request-promise');

exports.get_socket = function (req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
            } else {
              const ws = new WebSocket('wss://api.kcoin.club/');

              ws.onopen = function () {
                console.log('connected');
              };

              ws.onmessage = function (data) {
                console.log('incoming data', data)
              };
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
