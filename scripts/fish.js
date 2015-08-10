define([], function () {

function Fish (params) {
	params		= params 		|| {};
	this.id		= params.id;
	this.x 		= params.x 		|| 0;
	this.y 		= params.y 		|| 0;
	this.radius = params.radius || 50;
	this.color 	= params.color 	|| "#BE0D0D";
	this.speed	= 2;
	this.swing  = 1;
}

Fish.prototype.display = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
};

Fish.prototype.action = function (random) {
	this.x -= this.speed;
	this.y += random() > 0.5 ? this.swing:-this.swing;
}

return Fish;

});