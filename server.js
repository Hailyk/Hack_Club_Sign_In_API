'use strict';

// temp vars, testing and development only
var url = 'mongodb://localhost:27017';

var mongo = require('mongodb').MongoClient;
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clientList = {};

server.listen(80);

// send the index.html when http request to /
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

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