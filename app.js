var express = require('express');
var app = express();
var server = require('http').createServer(app);
//server
app.get('/',function(req, res) {
res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
console.log("Server started.");
//players and sockets
SOCKET_LIST = {};
var players = {};
var io = require('socket.io')(server);



io.sockets.on('connection', function(socket){

    function willCollide(object1, object2) {
    if (object1.x - 10 < object2.x + 10 &&
        object1.x + 10 > object2.x - 10 &&
        object1.y - 10 < object2.y + 10 &&
        object1.y + 10 > object2.y - 10) {
        return true;
    } else {
        return false;
    }
}
 
 console.log('new user!');
var socketId = Math.random();
SOCKET_LIST[socketId] = socket;

players[socketId] = {id:socketId, x:200, y:200, angle:180*Math.PI/180, name:null, up:false, ingame:false, crash:null, active:true, width:10, height:10};
socket.emit('setPlayerId', socketId);
for(var i in SOCKET_LIST){
 SOCKET_LIST[i].emit('players', players);
}
var playerName = "";
socket.on('move', function(data){
        
        let p1 = {x:data.x, y:data.y};
        let p2 = {x:data.x2, y:data.y2};
        let crash = willCollide(p1, p2);
        if(crash == true && typeof SOCKET_LIST[data.id] !== 'undefined'){
            if(typeof SOCKET_LIST[data.id2] !== 'undefined'){
            SOCKET_LIST[data.id].emit('crashed', data.id2);
            SOCKET_LIST[data.id2].emit('crashed', data.id);
            }
   }
   if(crash == false && typeof SOCKET_LIST[data.id] !== 'undefined') {
       if(typeof SOCKET_LIST[data.id2] !== 'undefined'){
       SOCKET_LIST[data.id].emit('stop', "lll");
       SOCKET_LIST[data.id2].emit('stop', "lll");
       }
   }
   for(var i in SOCKET_LIST){
       SOCKET_LIST[i].emit('moved', data);
   }
});
socket.on('joined', function(data){
    console.log(JSON.stringify(data.name)+" joined the game!");
    if(socketId === data.id){
            playerName = data.name;
        }
});
socket.on('ded', function(data){
    if(data != null){
    console.log("aww man! "+JSON.stringify(data)+" died!");
    }
})

 socket.on('disconnect',function(reason){
     console.log("oops, "+JSON.stringify(playerName)+" disconnected because of "+reason);
     delete SOCKET_LIST[socketId];
     delete players[socketId];
     for(var i in SOCKET_LIST){
      SOCKET_LIST[i].emit('dis', socketId);
  }
});
});
server.listen(8080);