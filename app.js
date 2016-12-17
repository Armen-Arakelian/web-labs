var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var busboyBodyParser = require('busboy-body-parser');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var csrf = require("csurf")
var session      = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboyBodyParser({ limit: '5mb' }));

require('./config/passport')(passport);


app.use(morgan('dev'));
app.use(cookieParser());
app.use(csrf({cookie: true}))
app.use(bodyParser());


app.set('view engine', 'ejs');

app.use(session({ secret: 'iloveruslanhadyniak' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./app/routes.js')(app, passport);
require('./api.js')(app);


app.listen(port);
console.log('Server is listenin on port ' + port);