var Idea = require('../app/models/idea');
var User = require('../app/models/user');
var Comment = require('../app/models/comment');
module.exports = function(app, passport) {


    app.get('/limitedAccess', isLoggedIn, function(req, res) {
        res.render("limitedAccess");
    });
    app.get('/users', function(req, res) {
        User.find({}, function(err, docs){
            res.render('users', {
                users : docs
            })
        })
    });
    app.get('/deleteUser', isAdmin, isLoggedIn, function(req, res) {
        res.render("deleteUser");
    });

    app.get('/deleteIdea', isAdmin, isLoggedIn, function(req, res) {
        res.render("deleteIdea");
    });

    app.get('/createIdea', isLoggedIn, function(req, res) {
        res.render("createIdea", {
            csrfToken: req.csrfToken()
        });
    });

    app.get('/notLoggedIn', function(req, res) {
        res.render("notLoggedIn");
    });

    app.post('/createIdea', function(req, res) {
        var image = req.files.picture;
        var picture64string = image.data.toString('base64');
        var idea = new Idea({
            title: req.body.title,
            text: req.body.text,
            author: req.user.local.email,
            authorId: req.user._id,
            picture : picture64string

        });
        idea.picture = picture64string;
        idea.save(function (err) {
            if (!err) {
                res.redirect("/idea/" + idea._id);
                return
            } else {
                console.log(err);
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
            }
        });
    });

    app.get('/', function(req, res) {
        res.render('index.ejs', {
            csrfToken: req.csrfToken()
        });
    });


    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            csrfToken: req.csrfToken()
        });
    });
    app.get('/admin', isLoggedIn, isAdmin, function(req, res) {
        res.render('admin.ejs');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));


    app.get('/signup', function(req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage'),
            csrfToken: req.csrfToken()
        });
    });


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/ideas', function(req, res) {
        Idea.find({}, function(err, ideas){
            res.render('ideas', {
                ideas : ideas
            })
        })
    });

    // ajax
    app.get('/getallusers', function(req, res){
        Idea.find(function(err, usrs){
            let results = usrs.map(usr => {
                usr.picture = usr.picture.toString('base64');
                return usr;
            });

            res.send(JSON.stringify(results ));
        })
    })

    app.get('/getsortedusers', function(req, res){
        Idea.find({title: req.query.fuser}, function (err, usrs){

            let results = usrs.map(function(usr) {
                let newUser = {
                    _id: usr.id,
                    author: usr.author,
                    authorId: usr.authorId,
                    picture: usr.picture.toString('base64'),
                    text: usr.text,
                    title: usr.title
                };
                return newUser;
            });

            res.send(JSON.stringify(results ));
        })
    })

    //

    app.get('/profile', isLoggedIn, function(req, res) {
        User.findOne({_id: req.user._id}, function (err, docs) {
            Idea.find({authorId: req.user._id}, function (err, ids) {
                res.render('user', {
                    ideas:ids,
                    user: docs
                })
            })
        })
    })


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.post('/deleteUser', isLoggedIn, isAdmin, function (req, res) {
        if(User.find({'local.email': req.body.email})) {
            User.remove({'local.email': req.body.email}, function (err) {
                if (!err) {
                    console.log("deleted");
                    res.redirect("/");
                }
                else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
            });
        }
        else{
        }
    })

    app.post('/deleteIdea', isLoggedIn, isAdmin, function (req, res) {
        if(Idea.find({'title': req.body.title})) {
            Idea.remove({'title': req.body.title}, function (err) {
                if (!err) {
                    console.log("deleted");
                    res.redirect("/");
                }
                else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
            });
        }
        else{
        }
    })

    app.post("/idea/:id", isLoggedIn, function (req, res) {
        var comment = new Comment({
            text: req.body.comment,
            ideaId: req.params.id.replace(" ", ""),
            author: req.user.local.email
        });
        comment.save(function (err) {
            if (!err) {
                res.redirect("back");
                return
            } else {
                console.log(err);
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
            }
        });
    })

    app.get('/idea/:id',  function(req, res) {

        Idea.findOne({_id: req.params.id}, function (err, docs) {
            Comment.find({ideaId: req.params.id}, function (err, comm) {
                res.render('idea', {
                    comments:comm,
                    idea: docs,
                    csrfToken: req.csrfToken()
                })
            })
        })
    })

    app.get('/users/:id', isLoggedIn, function(req, res) {
        if(req.params.id === req.user._id) {
            res.redirect("/profile")
            return
        }
        User.findOne({_id: req.params.id}, function (err, docs) {
            Idea.find({authorId: req.params.id}, function (err, ids) {
                res.render('user', {
                    ideas:ids,
                    user: docs,
                    csrfToken: req.csrfToken()
                })
            })
        })
    })



};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/notLoggedIn');
}

var isAdmin = function (req, res, next) {
    var currentUserId = req.user ? req.user.id : false;
    if(!currentUserId){
        res.redirect('/');
    }
    User.findById(currentUserId,function (err, user) {
        if(!user || user.local.role !== "admin"){
            res.redirect('/limitedAccess');
        }else{
            next();
        }
    })
}