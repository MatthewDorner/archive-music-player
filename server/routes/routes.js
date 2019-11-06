//server/routes/routes.js
var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../config/passport')(passport);

var jwt = require('jsonwebtoken');
var settings = require('../config/settings');

var Favorite = require('../../models/Favorite');
var User = require('../../models/User');

router.get('/', function(req, res) {
    res.render('index')
});

router.route('/insertFavorite')
    .post(function(req, res) {
        var token = getToken(req.headers);
        if (token) {

            var user;
            try {
                user = this.getUserFromToken(token);            
            } catch(e) {
                return res.status(401).send('Please log in to save your Favorites.');
            }

            // save a new Favorite with the username of the logged-in user
            var favorite = new Favorite();
            favorite.username = user;
            favorite.favoriteRecord = req.body.favoriteRecord;

            favorite.save(function(err) {
                if (err)
                    res.send(err);
                res.send('Favorite successfully added!');
            });
        } else {
            return res.status(401).send({ success: false, msg: 'Please log in to save your Favorites.' });
        }
    })

router.route('/deleteFavorite')
    .post(function(req, res) {
        var token = getToken(req.headers);
        if (token) {

            var user;
            try {
                user = this.getUserFromToken(token);            
            } catch(e) {
                return res.status(401).send('Please log in.');
            }

            // only delete if the Favorite record has the correct username of the logged-in user
            var id = req.query.id;
            Favorite.find({$and: [{ _id: id }, {username: user}]}).remove().exec(function(err, favorite) {
                if (err)
                    res.send(err)
                res.send('Favorite successfully deleted!');
            })
        } else {
            return res.status(401).send({ success: false, msg: 'Please log in.' });
        }
});

router.get('/getUserFavorites', function(req, res) {
    var token = getToken(req.headers);
    if (token) {

        var user;
        try {
            user = this.getUserFromToken(token);            
        } catch(e) {
            return res.status(401).send('Please log in to view your Favorites.');
        }

        // find all Favorite records with the username of the logged-in user
        Favorite.find({ username: user }, function(err, favorites) {
            if (err)
                res.send(err);
            res.json(favorites);
        });
    } else {
        return res.status(401).send({ success: false, msg: 'Please log in to view your Favorites.' });
    }
});

// copied from https://www.djamware.com/post/5a90c37980aca7059c14297a/securing-mern-stack-web-application-using-passport
router.route('/insertUser')
    .post(function(req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({ success: false, msg: 'Please pass username and password.' });
        } else {
            var newUser = new User({
                username: req.body.username,
                password: req.body.password
            });
            // save the user
            newUser.save(function(err) {
                if (err) {
                    return res.json({ success: false, msg: 'Username already exists.' });
                }
                res.json({ success: true, msg: 'Successfully created new user.' });
            });
        }
});

// copied from https://www.djamware.com/post/5a90c37980aca7059c14297a/securing-mern-stack-web-application-using-passport
router.route('/login')
    .post(function(req, res) {
        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
            } else {
                // check if password matches
                user.comparePassword(req.body.password, function(err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right create a token
                        var token = jwt.sign(user.toJSON(), settings.secret);
                        // return the information including token as JSON
                        res.json({
                            success: true,
                            token: 'JWT ' + token
                        });
                    } else {
                        res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
                    }
                });
            }
        });
});

// copied from https://www.djamware.com/post/5a90c37980aca7059c14297a/securing-mern-stack-web-application-using-passport
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

getUserFromToken = function(token){
    var decoded = jwt.verify(token, settings.secret);
    return decoded.username;
}

module.exports = router;
