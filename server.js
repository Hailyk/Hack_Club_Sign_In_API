'use strict';

// temp vars, testing and development only
var mongoUrl = 'mongodb://localhost:27017';
var restPort = 3000;
var socketPort = 80;

// dependencies
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var db = require("./db");

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


var clientList = {};

server.listen(socketPort);

db.connectDB(mongoUrl,function(){
    console.log("Starting server... ");
    app.listen(process.env.PORT || restPort, function(){
        console.log("Done.");
    });
});

// send the index.html when http request to /
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/member', function (req, res) {
    db.read("member", {}, function(result){
        res.status(200);
        res.send(JSON.stringify(result));
    });
});

app.post('/member', function (req, res) {
    db.create("member", req.body.where, function(result){
        res.status(201);
        res.send();
    });
});

app.put('/member', function (req, res) {
    db.updateMany("member", req.body.where, req.body.replace, function(result){
        res.status(204);
        res.send();
    });
});

app.delete('/member', function (req, res) {
    db.removeMany("member", req.body.where, function(result){
        res.status(204);
        res.send();
    });
});
app.post("/signin", function (req, res){
    db.read("member", {"member":req.body.id}, function(result){
        var member = result[0]._id;
        db.create("signin", {"member": member, "time": req.body.time}, function(){
            res.status(201);
            res.send();
        });
    });
});
app.get("/signin", function(req, res){
    db.read("signin", {}, function(result){
        if(result.length === 0){
            res.send("[]");
            return;
        }
        var signins = result;
        //creates array of all member object IDs
        var members = signins.map(function(doc){
            return doc.member;
        });
        
        //Find all members with IDs that have a signin, and loop through them.
        //Replace each ID with a member object
        db.read("member", {_id: {$in: members}}, function(result){
            var responceArray = [];
            for(var i=0;i<result.length;i++){
                for(var j=signins.length-1;j>=0;j--){
                    if(signins[j].member.equals(result[i]._id)){
                        signins[j].member = {fname:result[i].fname};
                        //Take out the signin (Since we know who it is) and put it int the responce
                        responceArray.push(signins.splice(j,1));
                    }
                }
            }
            
            res.send(JSON.stringify(responceArray));
        });
        
        
        
    });
});

// socket version
io.on('connection', function (socket) {
    // log socket id that just connected
    console.log(socket.id);
    
    // add socket id to client list
    clientList[socket.id] = "";
    // when get_socket_id event is received do ...
    socket.on('get_socket_id', function(data){
        // log the data received
        console.log(data);
        // send private message
        io.to(socket.id).emit("message", socket.id);
    });
    
    // do ... when client disconnect
    socket.on('disconnect', function(){
        console.log("socket: "+socket.id+" disconnected");
        
        // remove the socket id from the client list
        delete clientList[socket.id];
    });
});