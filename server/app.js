var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
//var User        = require('./app/models/user'); // get the mongoose model
var jwt         = require('jwt-simple');



var userAPI = require('./routes/userAPI');
var walletAPI = require('./routes/walletAPI');
var exchangeAPI = require('./routes/exchangeAPI');
var socketAPI = require('./routes/socketAPI');
var transactionAPI = require('./routes/transactionAPI');

var app = express();
app.use(cors());
mongoose.connect(config.database);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
require('./config/passport')(passport);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/users',userAPI);
app.use('/api/wallets',walletAPI);
app.use('/api/exchanges',exchangeAPI);
app.use('/api/sockets',socketAPI);
app.use('/api/transactions',transactionAPI);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

var WebSocket = require('ws');
const ws = new WebSocket('wss://api.kcoin.club/');

ws.onopen = function () {
  console.log('connected');
};
setInterval(
  () => ws.send(`${new Date()}`),//send message each 30s to connect not be expired
  30000
)
ws.onmessage = function (data) {
  console.log('data', data);
  console.log('data of KCoin', data.data);//từ data thu được này, chỉnh sửa và đồng bộ bên api
};
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
