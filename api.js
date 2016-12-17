var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
mongoose.Promise = Promise;

var morgan       = require('morgan');
var bodyParser   = require('body-parser');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);



module.exports = function(app) {
    app.use(morgan('dev'));
    app.use(bodyParser());

    app.set('view engine', 'ejs');

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    var User = require('./app/models/user');


    var router = express.Router();


    router.get('/', function (req, res) {
        res.json({message: 'api, set the url'});
    });


    router.route('/users')

        .post(function (req, res) {

            var user = new User();
            user.local.email = req.body.email;

            user.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'User created!'});
            });


        })

        .get(function (req, res) {
            User.find(function (err, users) {
                if (err)
                    res.send(err);

                res.json(users);
            });
        });

    router.route('/users/:user_id')

        .get(function (req, res) {
            User.findById(req.params.user_id, function (err, user) {
                if (err)
                    res.send(err);
                res.json(user);
            });
        })

        .put(function (req, res) {
            User.findById(req.params.user_id, function (err, user) {

                if (err)
                    res.send(err);

                user.local.email = req.body.email;
                user.save(function (err) {
                    if (err)
                        res.send(err);

                    res.json({message: 'User updated!'});
                });

            });
        })

        .delete(function (req, res) {
            User.remove({
                _id: req.params.user_id
            }, function (err, user) {
                if (err)
                    res.send(err);

                res.json({message: 'Successfully deleted'});
            });
        });

    router.get('/allUsers/:email',  function(req, res){
            User.findOne({'local.email': req.params.email}, function (err, user) {
                console.log(req.params.email)
                if (err)
                    res.send(err);
                res.json(user);
            });
        })

    app.use('/api', router);
}





