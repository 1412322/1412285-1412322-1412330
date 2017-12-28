
const path = require('path');
// const routes = require('./routes/api');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
// var config = require('./config/database');
const app = express();

app.use(express.static('public'));
app.set('src', path.join(__dirname, 'src'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/api', routes);

// app.use(morgan('dev'));

// app.use(passport.initialize());

// mongoose.connect(config.database);

// require('./config/passport')(passport);

app.use(function (err, req, res, next) {
	res.status(422).send({ error: err.message });
});

app.get('*', function (request, response) {
	response.sendFile(path.resolve(__dirname, 'src', 'index.html'))
})

app.listen(process.env.PORT || 3000, function () {
	console.log('Running on port 3000');
});