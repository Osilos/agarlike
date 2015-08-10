require.config({
	paths : {
		"jquery": "jquery-1.10.2"
	},
	shim : {
		"jquery" : {
			exports: "$"
		}
	},
	urlArgs: "d=" + Date.now()
})


define(['fish', 'player', 'jquery'], function (Fish, Player, Controller) {

var requestAnimFrame = 
	window.requestAnimationFrame 		||
    window.webkitRequestAnimationFrame 	||
    window.mozRequestAnimationFrame    	||
    window.oResquestAnimationFrame	   	||
    window.msRequestAnimationFrame	   	||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
};

var random = Math.random;

var canvas;
var ctx;
var fish = [];
var player;
var otherPlayer = [];

var singlePlayer = true;

var idPlayer;


function initCanvas () {
	canvas 	= $("#game")[0];	
	ctx 	= canvas.getContext('2d');
}

function initPlayer () {
	socket.emit('newPlayer', 'Coucou');
}

socket.on('newPlayer', function (data) {
	$(".id").append("Numéro : " + data);
	player = new Player({
		x : $(canvas).width() / 5,
		y : $(canvas).height() / 2,
		id : data
	});
	hudAppend("Masse : " + player.size);
	initController();
	gameLoop();
});

socket.on('newOtherPlayer', function (id) {
	otherPlayer.push(new Player({
		x : -20,
		y : -20,
		id : id
	}));
});

socket.on("errorID", function (e) {
	hudAppend("MAUVAIS ID");
});

socket.on("multiMode", function (data) {
	singlePlayer = false;
	idPlayer = data.id;
	if (data.role == "player") {
		player.controlMasque = false;
	} else if (data.role == "masque") {
		player.controlPlayer = false;
		player.id  = data.id;
	}
	hudAppend("Un joueur viens vous aider !");
});

socket.on("errorMode", function (e) {
	hudAppend("Le Joueur joue déjà avec quelqu'un !");
});

socket.on("masqueMove", function (data) {
	player.masqueX = data.masqueX;
	player.masqueY = data.masqueY;
});

function initController() {
	$("#btnConnect").click(function (e) {
		var idSearch = $("#connect").val();
		socket.emit('searchId', idSearch);
	});
	$(window).mousemove(function (e) {
		if (!player.controlPlayer) return;
		var coord = {x : e.pageX - $(canvas).position().left, y : e.pageY - $(canvas).position().top};
		if (!lose) player.move(coord, canvas);
	});
	$(window).keydown(function (e) {
		if (!player.controlMasque) return;
		if (e.keyCode == 90) player.masqueMoveUp(true);
		if (e.keyCode == 83) player.masqueMoveDown(true);
		if (e.keyCode == 81) player.masqueMoveLeft(true);
		if (e.keyCode == 68) player.masqueMoveRight(true);
	})
	$(window).keyup(function (e) {
		if (!player.controlMasque) return;
		if (e.keyCode == 90) player.masqueMoveUp(false);
		if (e.keyCode == 83) player.masqueMoveDown(false);
		if (e.keyCode == 81) player.masqueMoveLeft(false);
		if (e.keyCode == 68) player.masqueMoveRight(false);
	});

}

function sqr (param) {
	return param * param;
}

function respawn () {
	socket.emit("respawn", player.id);
}

socket.on("newID", function (newId) {
	player.id = newId;
	$(".id").empty();
	$(".id").append("Numéro : " + newId);
	setTimeout(function () {
		player.x = $(canvas).width() * random(),
		player.y = $(canvas).height() * random(),
		player.size = 10;
		//player.masqueX = this.masqueXstart;
		//player.masqueY = this.masqueYstart;
		player.masqueVelocityX = 0;
		player.masqueVelocityX = 0;
		lose = false;
		hudAppend("Masse : " + player.size);
		gameLoop();
	}, 1500);
});


function collider() {
	for (var i = fish.length - 1; i >= 0; i--) {
		var contactDistance = player.size + fish[i].radius / 2;
		if (Math.sqrt(sqr(player.y - fish[i].y) + sqr(player.x - fish[i].x)) <= contactDistance){
			if (player.size >= fish[i].radius) {
				player.size += 1;
				hudAppend("Masse : " + player.size);
				socket.emit("fishDie", fish[i].id);
				fish.splice(i, 1);
			} else {
				socket.emit("playerLose", player.id);
				lose = true;
			}
		}
	}
	for (var i = otherPlayer.length - 1; i >= 0; i--) {
		var contactDistance = player.size + otherPlayer[i].size / 2;
		if (Math.sqrt(sqr(player.y - otherPlayer[i].y) + sqr(player.x - otherPlayer[i].x)) <= contactDistance){
			if (player.size > otherPlayer[i].size) {
				player.size += 1;
				hudAppend("Masse : " + player.size);
				socket.emit("playerLose", otherPlayer[i].id);
				otherPlayer.splice(i, 1);
			} else if (player.size < otherPlayer[i].size) {
				socket.emit("playerLose", player.id);
				lose = true;
			}
		}
	}
}

function hudAppend (pText) {
	$("header").empty();
	$("header").append("<h1>" + pText + "</h1>");
}

socket.on("fishDie", function (id) {
	for (var i = fish.length - 1; i >= 0; i--) {
		if (fish[i].id === id) {
			fish.splice(i, 1);
			break;
		}
	};
});

var lose = false;


function gameLoop () {
	
    requestAnimFrame(function () {
    	for (var i = fish.length - 1; i >= 0; i--) {
    		fish[i].action(random);
    	};
    	
        displayAll();
       	if (lose) {
        	hudAppend("Perdu !");
        	respawn();
        } else {
        	player.update();
        	collider();
        	gameLoop();
        }
    });
}

socket.on('playerLose', function (playerID) {
	if (playerID == player.id) lose = true;
	else {
		for (var i = otherPlayer.length - 1; i >= 0; i--) {
			if (otherPlayer[i].id === playerID) {
				hudAppend("Player " + playerID + " a perdu");
				otherPlayer.splice(i, 1);
			}
		};		
	}

})

socket.on('newFish', function (data) {
	fish.push(new Fish({
		x : $(canvas).width(), 
		y : data.y, 
		radius : data.size,
		id : data.id
	}));
});

socket.on('otherPlayerMove', function (data){
	for (var i = otherPlayer.length - 1; i >= 0; i--) {
		if (otherPlayer[i].id === data.id) {
			otherPlayer[i].x = data.x;
			otherPlayer[i].y = data.y;
			otherPlayer[i].size = data.size
			return;
		}
	};
	otherPlayer.push(new Player({
		x : data.x,
		y : data.y,
		id : data.id
	}));
});

function displayAll () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = fish.length - 1; i >= 0; i--) {
		if (fish[i].x < 0) {
			fish.splice(i, 1);
			continue;
		}
		fish[i].display(ctx);
	};

	var lPlayer;
	for (var i = otherPlayer.length - 1; i >= 0; i--) {
		if (otherPlayer[i] === null) continue;
		if (otherPlayer[i].id == player.id) lPlayer = otherPlayer[i];
		else otherPlayer[i].display(ctx);
	};

	ctx.drawImage(masque, player.masqueX, player.masqueY);

	//player en last
	if (!lose) player.display(ctx);
	if (!player.controlPlayer) {
		lPlayer.display(ctx);
	}
}

var masque = new Image();




$(function () {

	masque.src = 'css/masque.png';	
	masque.onload = function() {
    	

    	initCanvas();
		ctx.drawImage(masque, - $(canvas).width()	, -$(canvas).height());
		initPlayer();
	};
})	

});