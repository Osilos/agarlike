var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io 		= require('socket.io')(http);

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

app.use(express.static(__dirname));

var currentId	= 0;
var players 	= {};
var idFish		= [];

var popFishTime = 1000;
var minSizeFish = 5;
var fishPoping = false;

var random = Math.random;

function popFish(data) {
	var sizeNewFish = Math.round(random() * 20) + minSizeFish; 
	idFish.push(0);
	return {
		size 	: sizeNewFish,
		y 		: 50 + sizeNewFish + Math.round(random() * (600 - 50)),
		id 		: idFish.length -1
	};
}


io.on('connection', function (socket) {
	console.log('a user is connected');
	
	var player;
	var friendPlayer = null;


	socket.emit('welcome', 'COUCOU');

	socket.on("playerMasque", function (data) {
		if (friendPlayer != null) friendPlayer.socket.emit("masqueMove", data);
	});

	socket.on("searchId", function (id) {
		friendPlayer = players[id];
		if (!friendPlayer)
		{
			socket.emit("errorID", null);
		}
		else if (!friendPlayer.singlePlayerMode) {
			socket.emit("errorMode", null);
		} else {
			friendPlayer.singlePlayerMode = false;
			friendPlayer.masque = player;
			player.mover = friendPlayer;
			friendPlayer.socket.emit("multiMode", {role: "player", id: player.id});
			socket.emit("multiMode", {role: "masque", id: friendPlayer.id});
		}
	});

	socket.on('newPlayer', function (data) {
		currentId++;
		player = {
			id: currentId,
			singlePlayerMode : true,
			socket : socket
		};

		players[currentId] = player;


		socket.emit('newPlayer', currentId);
		socket.broadcast.emit('newOtherPlayer', currentId);
	});

	socket.on("respawn", function (id) {
		currentId++;
		delete players[id];
		players[currentId] = {
			singlePlayerMode : true,
			socket : socket
		};
		socket.emit("newID", currentId);
		socket.broadcast.emit("newOtherPlayer", currentId);
	});

	socket.on('playerMove', function (data){
		data.id = player.id;
		socket.broadcast.emit('otherPlayerMove', data);
	});

	socket.on('playerLose', function (data) {
		socket.broadcast.emit('playerLose', data);
	});

	socket.on('disconnect', function(){	
        console.log('user disconnected');
    });

	socket.on("fishDie", function (id) {

		socket.broadcast.emit("fishDie", id);
	});

	socket.on('disconnect', function () {

	});  

	function createFish () {
		var fish = popFish() || false;
		io.emit('newFish', fish);
	}

	if (fishPoping == false) {
		fishPoping = setInterval(createFish, popFishTime);
	}
});






http.listen(8888, function () {
  console.log('listening on *:8888');
});