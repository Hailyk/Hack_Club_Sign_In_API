'use strict';

var url = 'mongodb://localhost:27017';

var mongo = require('mongodb').MongoClient;
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clientList = {};

server.listen(80);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log(socket.id);
    clientList.socketId = "";
    socket.on('get_socket_id', function(data){
        console.log(data);
        // send private message
        io.to(socket.id).emit("message", "secret message for you");
    });
    socket.on('disconnect', function(){
        console.log("socket: "+socket.id+" disconnected");
        delete clientList[socket.id];
    });
});