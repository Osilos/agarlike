define(['fish'], function (Fish) {

	function Player (params) {
	    params      = params        || {};
	    this.id		= params.id;
	    this.x      = params.x      || 0;
	    this.y      = params.y      || 0;
	    this.color  = params.color  || '#2D1EBB';
	    this.size = 10;


	   	this.masqueXstart = -1250;
	    this.masqueYstart = -700;
	    this.masqueX = this.masqueXstart;
	    this.masqueY = this.masqueYstart;
	    this.masqueVelocityX =0;
	    this.masqueVelocityY =0;
	    this.masqueWidth = 1500;
	    this.masqueHeight = 1000;

	    this.controlMasque = true;
		this.controlPlayer = true;

	    this.masqueSpeed = 20;

	    this.controller = {left : 0, right : 0, up : 0, down : 0};

	    params.color = this.color;
	    params.radius = this.size;
	    this.fish = new Fish(params);
	    this.velocityX = 0;
    	this.velocityY = 0;

    	this.targetY = this.y;
    	this.targetX = this.x;

    	this.speed = 700;
    	this.speedMin = 50;
	}

	Player.prototype.masqueMoveUp = function (value) {
		this.controller.up = value;
	};

	Player.prototype.masqueMoveDown = function (value) {
		this.controller.down = value;
	};

	Player.prototype.masqueMoveRight = function (value) {
		this.controller.right = value;
	};

	Player.prototype.masqueMoveLeft = function (value) {
		this.controller.left = value;
	};


	Player.prototype.display = function (ctx) {
	    this.fish.x = this.x;
	    this.fish.y = this.y;
	    this.fish.radius = this.size;
	    this.fish.display(ctx);
	};

	Player.prototype.move = function (e, canvas) {
		this.targetY = e.y;
		this.targetX = e.x;
		//recentre la target au centre du player
		this.targetX -= this.size / 2;
		this.targetY -= this.size / 2;
		if (this.targetX > $(canvas).width()) this.targetX = $(canvas).width();
		if (this.targetY > $(canvas).height()) this.targetY = $(canvas).height();
	}

	Player.prototype.updateMasque = function () {
		if (this.controller.up == true) this.masqueVelocityY -= this.masqueSpeed;
		if (this.controller.down == true) this.masqueVelocityY += this.masqueSpeed;
		if (this.controller.left == true) this.masqueVelocityX -= this.masqueSpeed;
		if (this.controller.right == true) this.masqueVelocityX += this.masqueSpeed;

		this.masqueVelocityY *= 1 - dampingMasque;
		this.masqueVelocityX *= 1 - dampingMasque;



		this.masqueY += this.masqueVelocityY * deltaTime;
		this.masqueX += this.masqueVelocityX * deltaTime;


		//console.log(this.masqueX);
		if (this.masqueX + this.masqueWidth < 0) this.masqueX = -this.masqueWidth;
		if (this.masqueY + this.masqueHeight < 0) this.masqueY = - this.masqueHeight;
		if (this.masqueX + this.masqueWidth > 1250) this.masqueX = -this.masqueWidth + 1250;	
		//if (this.masqueY < -this.masqueHeight) this.masqueY = 0;



	}

	var damping = 0.6;
	var dampingMasque = 0.05;
	var deltaTime = 0.025;

	var rangeLimit = 250;
	var masseFactor = 0.05;
	Player.prototype.update = function () {

		this.updateMasque();

		this.velocityX = (this.x - this.targetX) / (this.size * masseFactor);		
		this.velocityY = (this.y - this.targetY) / (this.size * masseFactor);

		this.velocityX *= 1 - damping;
		this.velocityY *= 1 - damping;

		this.x += -this.velocityX * deltaTime;
	    this.y += -this.velocityY * deltaTime;

	    if (this.controlPlayer) {
	    	socket.emit('playerMove', {x : this.x, y : this.y, size : this.size});
	    } else if (this.controlMasque) {
	    	socket.emit('playerMasque', {masqueX : this.masqueX, masqueY : this.masqueY});
	    }
	};

	return Player;
});