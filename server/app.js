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
var config    = require('./config/database'); // get db config file
//var User        = require('./app/models/user'); // get the mongoose model
var jwt         = require('jwt-simple');
var request = require('request');
const rp = require('request-promise');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

var nBlocks = require('./models/nBlocks');
var User = require('./models/user');
var ReferenceOutput = require('./models/referenceOutput');
var Transaction = require('./models/transaction');
var Block = require('./models/block');
var ReferenceOutput = require('./models/referenceOutput');

var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    secureConnection: false,
    auth: {
        user: '1412285.1412322.1412330.group@gmail.com',
        pass: 'kcoin1234'
    }
}));

var userAPI = require('./routes/userAPI');
var walletAPI = require('./routes/walletAPI');
var exchangeAPI = require('./routes/exchangeAPI');
var socketAPI = require('./routes/socketAPI');
var transactionAPI = require('./routes/transactionAPI');
var twoFaAPI = require('./routes/twoFaAPI');
var adminAPI = require('./routes/adminAPI');

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
app.use('/api/twoFa', twoFaAPI);
app.use('/api/admin', adminAPI);

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
    UpdateData();
};
setInterval(
  () => ws.send(`${new Date()}`),//send message each 30s to connect not be expired
  30000
)
ws.onmessage = function (data) {
  console.log('data', data);
  console.log('data of KCoin', data.data);//từ data thu được này, chỉnh sửa và đồng bộ bên api
  var source = JSON.parse(data.data);
  console.log("Type data: " + source.type);
  if(source.type == "block")
  {
    SaveBlock(source.data);
    SaveTransaction(source.data.transactions);
    UpdateReferenceOutputUser(source.data.transactions);
    UpdateRealMoneyUser(source.data.transactions);
    nBlocks.find(function(err,nblocks){
      if(nblocks)
      {
        var updateN = new nBlocks();
        updateN._id = nblocks[0]._id;
        updateN.value = nblocks[0].value + 1;
        nBlocks.findByIdAndUpdate(nblocks[0]._id, updateN, {}).exec(function (err)
        {
          if(err)
            console.log(err);
        });
      }
    });
  }
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

UpdateData = function(){
  nBlocks.find(function(err,nblocks)
  {
    if(!err)
    {
      if(nblocks[0].value === 0)
      {
        var headers, options;
        headers = {
          'User-Agent':       'Super Agent/0.0.1',
          'Content-Type':     'application/x-www-form-urlencoded'
        }
        options = {
          url: 'https://api.kcoin.club/blocks',
          method: 'GET',
          headers: headers
        }

        request(options, function (error, response, body) {
          if (!error)
          {
            var headerRes = response.headers;
            var totalBlock = headerRes['x-total-count'];
            var updateN = new nBlocks();
            updateN._id = nblocks[0]._id;
            updateN.value = totalBlock;
            for (let i = 0; i < totalBlock; i++)
            {
              option = {
                url: 'https://api.kcoin.club/blocks/' + i,
                method: 'GET',
                headers: headers,
                json: true
              }
              UpdateDataValues(option);
            }

            nBlocks.findByIdAndUpdate(nblocks[0]._id, updateN, {}).exec(function (err)
            {
              if(err)
                console.log(err);
            });

          }
        });

      }
      else
      {
        var headers, options;
        headers = {
          'User-Agent':       'Super Agent/0.0.1',
          'Content-Type':     'application/x-www-form-urlencoded'
        }
        options = {
          url: 'https://api.kcoin.club/blocks',
          method: 'GET',
          headers: headers
        }
        request(options, function (error, response, body) {
          if (!error)
          {
            var headerRes = response.headers;
            var totalBlock = headerRes['x-total-count'];
            if(nblocks[0].value < totalBlock)
            {
              for (let i = nblocks[0].value; i < totalBlock; i++)
              {
                option = {
                  url: 'https://api.kcoin.club/blocks/' + i,
                  method: 'GET',
                  headers: headers,
                  json: true
                }
                UpdateDataValues(option);
              }
              var updateN = new nBlocks();
              updateN._id = nblocks[0]._id;
              updateN.value = totalBlock;
              nBlocks.findByIdAndUpdate(nblocks[0]._id, updateN, {}).exec(function (err)
              {
                if(err)
                {
                  console.log(err);
                }
              });
            }
          }
        });
      }
    }
  });
}

UpdateDataValues = function(option)
{
  return rp(option)
  .then(function(data){
    SaveBlock(data);
    SaveTransaction(data.transactions);
    UpdateReferenceOutputUser(data.transactions);
    UpdateRealMoneyUser(data.transactions);
  })
  .catch(function (err) {
      console.log(err);
  });
};

SaveBlock = function(data)
{
  async.parallel({
  listUser: function (callback) {
    User.find({}).sort({}).exec(callback);
      }
   }, function (err,result) {
     //console.log(result.listUser.length);
     var isSave = false;
     for(let i=0; i<data.transactions.length; i++)
     {
       if(data.transactions[i].inputs[0].unlockScript.indexOf("PUB") != -1)
       {
         for(let j=0; j<result.listUser.length;j++){
           if(result.listUser[j].publicKey == data.transactions[i].inputs[0].unlockScript.split(" ")[1])
           {
             isSave=true;
             break;
           }
         }
         if(isSave==false)
         {
           for(let j=0; j<data.transactions[i].outputs.length;j++)
           {
             for(let k=0; k<result.listUser.length;k++)
             {
               if(result.listUser[k].address == data.transactions[i].outputs[j].lockScript.split(" ")[1])
               {
                 isSave=true;
                 break;
               }
             }
             if(isSave)
              break;
           }
         }
         else {
           break;
         }
       }
       else {
         for(let j=0; j<data.transactions[i].outputs.length;j++)
         {
           for(let k=0; k<result.listUser.length;k++)
           {
             if(result.listUser[k].address == data.transactions[i].outputs[j].lockScript.split(" ")[1])
             {
               isSave=true;
               break;
             }
           }
           if(isSave)
            break;
         }
       }
     }
     if(isSave)
     {
       var block = new Block();
       block.hash = data.hash;
       block.nonce = data.nonce;
       block.timestamp = data.timestamp;
       block.difficulty = data.difficulty;
       block.transactionsHash = data.transactionsHash;
       block.previousBlockHash = data.previousBlockHash;
       for(let i=0;i<data.transactions.length; i++)
       {
         block.transactions.push(data.transactions[i].hash);
       }
       block.save(function(err){
         if(err)
           console.log(err);
       });
     }
   });




};

SaveTransaction = function(transactions)
{
  for(let i=0;i<transactions.length;i++)
  {
    Transaction.findOne({hash: transactions[i].hash}, function(err, result){
      if(err) throw err;
      if(result)
      {
        if(result.state == "unconfirmed"){
          Transaction.findByIdAndUpdate(result._id,{$set:{state:"confirmed"}},{ new: true },function (err){
            if(err)
              console.log(err);
              else {
                User.findOne({publicKey: result.inputs[0].unlockScript.split(" ")[1]}, function(err, user){
                  if(err)
                    console.log(err);
                  else{
                    if(user)
                    {
                      var sendMoney = 0;
                      for(let j=0; j<result.outputs.length;j++)
                      {
                        if(result.outputs[j].lockScript.split(" ")[1] != user.address)
                        {
                          sendMoney += result.outputs[j].value;
                        }
                      }
                      User.findByIdAndUpdate(user._id,{$set:{availableMoney: user.availableMoney-sendMoney}},{ new: true },function (err){
                        if(err)
                          console.log(err);
                      });
                    }
                  }
                });
              }
          });
        }
      }
      else
      {
        async.parallel({
        listUser: function (callback) {
          User.find({}).sort({}).exec(callback);
            }
         }, function (err,result) {
           var isSave=false;
           if(transactions[i].inputs[0].unlockScript.indexOf("PUB") != -1)
           {
             for(let j=0; j<result.listUser.length;j++){
               if(result.listUser[j].publicKey == transactions[i].inputs[0].unlockScript.split(" ")[1])
               {
                 isSave=true;
                 break;
               }
             }
             if(isSave==false)
             {
               for(let j=0; j<transactions[i].outputs.length;j++)
               {
                 for(let k=0; k<result.listUser.length;k++)
                 {
                   if(result.listUser[k].address == transactions[i].outputs[j].lockScript.split(" ")[1])
                   {
                     isSave=true;
                     break;
                   }
                 }
                 if(isSave)
                  break;
               }
             }
           }
           else
           {
             for(let j=0; j<transactions[i].outputs.length;j++)
             {
               for(let k=0; k<result.listUser.length;k++)
               {
                 if(result.listUser[k].address == transactions[i].outputs[j].lockScript.split(" ")[1])
                 {
                   isSave=true;
                   break;
                 }
               }
               if(isSave)
                break;
             }
           }

           if(isSave){
             var newTran = new Transaction();
             newTran.hash = transactions[i].hash;
             newTran.state = "confirmed";
             for(let j=0; j<transactions[i].inputs.length; j++)
             {
               newTran.inputs.push(transactions[i].inputs[j]);
             }
             for(let k=0; k<transactions[i].outputs.length; k++)
             {
               newTran.outputs.push(transactions[i].outputs[k]);
             }
             newTran.save(function(err){
               if(err)
                 console.log(err);
             });
           }
         });
      }
    });

  }
};
UpdateReferenceOutputUser = function(transactions){
  for(let i=0; i<transactions.length;i++)
  {
    for(let j=0;j<transactions[i].inputs.length; j++)
    {
      if(transactions[i].inputs[j].unlockScript.indexOf("PUB") != -1)
      {
        User.findOne({publicKey: (transactions[i].inputs[j].unlockScript).split(" ")[1]}, function (err, user)
        {
          if(user){
            ReferenceOutput.findOneAndRemove({referencedOutputHash:transactions[i].inputs[j].referencedOutputHash, address: user.address},function(err){
              if(err)
                console.log(err);
            });
          }
        });
      }

    }
    for(let j=0;j<transactions[i].outputs.length; j++)
    {
      User.findOne({address: transactions[i].outputs[j].lockScript.split(" ")[1]}, function(err, user){
        if(err) throw err;
        if(user)
        {
          var newReference = new ReferenceOutput();
          newReference.referencedOutputHash = transactions[i].hash;
          newReference.referencedOutputIndex = j;
          newReference.address = transactions[i].outputs[j].lockScript.split(" ")[1];
          newReference.money = transactions[i].outputs[j].value;
          newReference.save(function(err){
            if(err)
              console.log(err);
          });
        }
      });

    }
  }
}

UpdateRealMoneyUser = function(transactions)
{
  for(let i=0;i<transactions.length;i++)
  {
    var inputs = transactions[i].inputs;
    var outputs = transactions[i].outputs;
    if(inputs[0].unlockScript.indexOf("PUB") != -1)
    {
      User.findOne({publicKey: (inputs[0].unlockScript).split(" ")[1]}, function (err, sender)
      {
        if(!sender)
        {
          for(let j=0; j<outputs.length; j++)
          {
            User.findOne({address: outputs[j].lockScript.split(" ")[1]},function(err, user)
            {
              if(user){
                User.findByIdAndUpdate(user._id,{$set:{realMoney: user.realMoney + outputs[j].value}},{ new: true },function (err){
                  if(err)
                    console.log(err);
                    else {
                      SendMail(user);
                    }
                });
              }

            });
          }
        }
        else
        {
          var sum = 0;
          for(let j=0; j<outputs.length; j++)
          {
            if(outputs[j].lockScript.split(" ")[1] != sender.address)
            {
              sum += outputs[j].value;
              User.findOne({address: outputs[j].lockScript.split(" ")[1]},function(err, user)
              {
                if(user){
                  User.findByIdAndUpdate(user._id,{$set:{realMoney: user.realMoney + outputs[j].value}},{ new: true },function (err){
                    if(err)
                      console.log(err);
                      else {
                        SendMail(user);
                      }
                  });
                }
              });
            }
          }
          User.findByIdAndUpdate(sender._id,{$set:{realMoney: sender.realMoney - sum}},{ new: true },function (err){
            if(err)
              console.log(err);
              else {
                SendMail(sender);
              }
          });

      }
      });
    }
    else
    {
      for(let j=0; j<outputs.length; j++)
      {
        User.findOne({address: outputs[j].lockScript.split(" ")[1]},function(err, user)
        {
          if(user)
          {
            User.findByIdAndUpdate(user._id,{$set:{realMoney: user.realMoney + outputs[j].value, availableMoney:user.realMoney + outputs[j].value}},{ new: true },function (err){
            if(err)
              console.log(err);
              else {
                SendMail(user);
              }
            });
          }
        });
      }
    }
  }
}

SendMail = function (user) {


    var mailOptions = {
        to: user["email"],
        subject: "Walet information",
        html: "Actual balance: "+user.realMoney+"<br> Available money: "+(user.realMoney-user.availableMoney)+"<br>"
    }
    console.log('mailOptions: ', mailOptions);
    transport.sendMail(mailOptions, function (error, response) {
        if (error) {

        }
        else {

        }
    });
};

module.exports = app;
