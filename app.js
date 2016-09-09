var express = require('express');
var app = express();
var port = process.env.PORT || 8181;
var bodyParser = require('body-parser');
var _ = require('underscore');

var mongoose = require('mongoose');
mongoose.connect('mongodb://test-mongo-lab:testmongolab@ds017155.mlab.com:17155/node-example');
var User = require('./model/User.js');

app.use(bodyParser.json());

app.get('/users', function(req, res) {
    var queryParams = req.query;
    var condition = {};
    if (queryParams.hasOwnProperty('admin')) {
        if (queryParams.admin === 'true') {
            condition = {isAdmin:true};
        }
        else if (queryParams.admin === 'false') {
            condition = {isAdmin:false};
        }
    } 
    User.find(condition).exec(function(err, users) {
        if (err) {
            res.send('An error has occured');
        }
        else {
            res.json(users);
        }
    });
    
})

app.get('/users/:id', function(req, res) {
    var userId = req.params.id;
    User.findOne({_id:userId}).exec(function(err, user) {
        if(err) {
            res.send('An error has occured');
        }
        else {
            res.json(user);
        }
    })
})

app.post('/users', function(req, res) {
    User.create(req.body, function(err, user) {
        if (err) {
            res.send("An error has occured");
        } else {
            res.json(user);
        }
    })
})

app.delete('/users/:id', function (req, res) {
    var userId = req.params.id;
    User.findOneAndRemove({_id:userId}, function(err, user){
        if (err) {
            res.send("An error has occured");
        }
        else {
            res.json(user);
        }
    });

});

app.put('/users/:id', function (req, res) {
    var userId = req.params.id;
    var body = _.pick(req.body, 'username', 'password', 'isAdmin');
    var normalizeUser = {};

    if (body.hasOwnProperty('isAdmin') && _.isBoolean(body.isAdmin)) {
        normalizeUser.isAdmin = body.isAdmin;
    }
    else if (body.hasOwnProperty('isAdmin')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('username') && _.isString(body.username)) {
        normalizeUser.username = body.username;
    }
    else if (body.hasOwnProperty('username')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('password') && _.isString(body.password)) {
        normalizeUser.password = body.password;
    }
    else if (body.hasOwnProperty('password')) {
        return res.status(400).send();
    }

    User.findOneAndUpdate({
       _id: userId
    }, {$set:normalizeUser}, {upsert:true}, function (err, updatedUser) {
        if (err) {
            res.send("An error has occured");
        }
        else {
            res.json(updatedUser);
        }
    });
})

app.listen(port);