//First get access to our canvas object we've defined in our html
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

//sets a listener functions so we can get input from the player
window.addEventListener('keydown', function(evt) { onKeyDown(evt); }, false);
window.addEventListener('keyup', function(evt) { onKeyUp(evt); }, false);

////////////////////////////////////////////////////////////
//CONSTANTS
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var ASTEROID_SPEED = 0.8;
var PLAYER_SPEED = 5;
var PLAYER_TURN_SPEED = 0.09;
var BULLET_SPEED = 15;

//Constant 
var KEY_SPACE 	= 32;
var KEY_LEFT 	= 37;
var KEY_UP 		= 38;
var KEY_RIGHT	= 39;
var KEY_DOWN 	= 40;

//GAME_STATE CONSTANTS
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

//ALL OUR VARIABLES
////////////////////////////////////////////////////////////
//Grass Tiles
var Grass = document.createElement("img");

Grass.src = "grass.png";

var Background = [];

for (var y = 0; y < 15; y++)
{
	Background[y] = [];
	for (var x = 0; x < 20; x++)
	{
		Background[y][x] = Grass;
	}
}

////////////////////////////////////////////////////////////
//Player Values
var Player = 
{
	image : document.createElement("img"),
	x : SCREEN_WIDTH/2,
	y : SCREEN_HEIGHT/2,
	width : 93,
	height : 80,
	directionX: 0,
	directionY: 0,
	Dead : false,
	angularDirection: 0,
	rotation: 0
};

//set the image for the player to use
Player.image.src = "ship.png";

////////////////////////////////////////////////////////////
//Asteroids

var Asteroids = [];
var AsteroidSpawnTimer = 0;

function spawnAsteroid()
{
	var type = rand(0 ,3);
	var newAsteroid = {};

	//gives the Asteroid large, medium or small depending on random number
	newAsteroid.image = document.createElement("img");
	if (type == 0)
	{
		newAsteroid.image.src = "rock_large.png";
		newAsteroid.width = 69;
		newAsteroid.height = 75;
	}
	if (type == 1)
	{
		newAsteroid.image.src = "rock_medium.png";
		newAsteroid.width = 40;
		newAsteroid.height = 50;
	}
	if (type == 2)
	{
		newAsteroid.image.src = "rock_small.png";
		newAsteroid.width = 22;
		newAsteroid.height = 20;
	}

	//starts the Asteroid in the middle of the screen
	newAsteroid.x = SCREEN_WIDTH/2;
	newAsteroid.y = SCREEN_HEIGHT/2;

	//start with a random vector
	var dirX = rand(-10, 10);
	var dirY = rand(-10, 10);
	//normalises it
	var Magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
	if (Magnitude != 0)
	{
		dirX *= 1/ Magnitude;
		dirY *= 1/ Magnitude;
	}

	//taking the random vector we move outwards from the centre of the screen
	//in that direction
	var movY = dirY * SCREEN_HEIGHT;
	var movX = dirX * SCREEN_WIDTH;

	//Actually moves the asteroid
	newAsteroid.x += movX;
	newAsteroid.y += movY;

	//puts it on course towards the centre of the screen by reversing the vector
	newAsteroid.velocityX = -dirX * ASTEROID_SPEED;
	newAsteroid.velocityY = -dirY * ASTEROID_SPEED;

	//finally adds the newAsteroid to our Asteroids Array
	Asteroids.push(newAsteroid);
}

////////////////////////////////////////////////////////////
//Bullet Values
var Bullets = [];

//function fires a bullet in the diretcion the player is facing
function playerShoot()
{
	var Bullet = 
	{
		image : document.createElement("img"),
		x : Player.x,
		y : Player.y,
		width : 5,
		height : 5,
		velocityX : 0,
		velocityY : 0
	}
	Bullet.image.src = "bullet.png"

	//start off with a direction straight up
	var dirX = 0;
	var dirY = 1;

	//rotates said direction by player rotation
	var s = Math.sin(Player.rotation);
	var c = Math.cos(Player.rotation);
	var xVel = (dirX * c) - (dirY * s);
	var yVel = (dirX * s) + (dirY * c);

	//gives the bullet calculated velocity times it's speed
	Bullet.velocityX = xVel * BULLET_SPEED;
	Bullet.velocityY = yVel * BULLET_SPEED;

	//starts the bullet at the player coordinates
	Bullet.x = Player.x;
	Bullet.y = Player.y; 

	Bullets.push(Bullet);
}

////////////////////////////////////////////////////////////
//Misc Functions

//returns a random real value between floor and ceil
function rand(floor, ceil)
{
	return Math.floor( (Math.random() * (ceil - floor)) + floor );
}

//AABB Collision function
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if ( 	y2 + h2 < y1 ||
			x2 + w2 < x1 ||
				x2 > x1 + w1 ||
				y2 > y1 + h1)
		return false;

	return true;
}

////////////////////////////////////////////////////////////

var ShootTimer = 0;

//Function called when key is pressed down
function onKeyDown(event)
{
	if (event.keyCode == KEY_UP)
	{
		Player.directionY = 1;
	}
	if (event.keyCode == KEY_DOWN)
	{
		Player.directionY = -1;
	}
	if (event.keyCode == KEY_LEFT)
	{
		Player.angularDirection = -1;
	}
	if (event.keyCode == KEY_RIGHT)
	{
		Player.angularDirection = 1;
	}
	if (event.keyCode == KEY_SPACE && ShootTimer <= 0)
	{
		ShootTimer += .5;
		playerShoot();
	}
}

//Function called when key is released
function onKeyUp(event)
{
	if (event.keyCode == KEY_UP)
	{
		Player.directionY = 0;
	}
	if (event.keyCode == KEY_DOWN)
	{
		Player.directionY = 0;
	}
	if (event.keyCode == KEY_LEFT)
	{
		Player.angularDirection = 0;
	}
	if (event.keyCode == KEY_RIGHT)
	{
		Player.angularDirection = 0;
	}
}

//Here we define the variable that keeps track of the time between frames
var lastUpdate = Date.now();

//
var SplashTimer = 3;
function runSplash(dt)
{
	//counts down three seconds then switchs to the game
	SplashTimer -= dt;
	if (SplashTimer <= 0)
	{
		gameState = STATE_GAME;
		return;
	}

	context.fillStyle = "#000";
	context.font = "18px Arial";
	context.fillText("Asteroids", 200, 240);

}

function runGame(dt)
{
	//updates shoot timer
	if (ShootTimer > 0)
		ShootTimer -= dt;

	//draws our background tiles
	for (var y = 0; y < 15; y++)
	{
		for (var x = 0; x < 20; x++)
		{
			context.drawImage( Background[y][x],
							   x * 32, y * 32);
		}
	}

	////////////////////////////////////////////////////////////
	//Player Movement
	var s = Math.sin(Player.rotation);
	var c = Math.cos(Player.rotation);

	var xDir = (Player.directionX * c) - (Player.directionY * s);
	var yDir = (Player.directionX * s) + (Player.directionY * c);
	var xVel = xDir * PLAYER_SPEED;
	var yVel = yDir * PLAYER_SPEED;

	//adds our calculated velocity
	Player.x += xVel;
	Player.y += yVel;

	//Rotates the player
	Player.rotation += Player.angularDirection * PLAYER_TURN_SPEED;

	//draw the player adjusting player origin
	if(!Player.Dead)
	{
	context.save();
		context.translate( Player.x, Player.y);
		context.rotate(Player.rotation);
		context.drawImage(Player.image, -Player.width/2, -Player.height/2);
	context.restore();
	}
	
	////////////////////////////////////////////////////////////
	//Asteroid Movement
	for (var i = 0; i < Asteroids.length; i++)
	{
		//moves the Asteroid
		Asteroids[i].x += Asteroids[i].velocityX;
		Asteroids[i].y += Asteroids[i].velocityY;

		//Draws the Asteroid
		context.drawImage( Asteroids[i].image, Asteroids[i].x, Asteroids[i].y );

	}

	//spawns a new one every SECOND 
	AsteroidSpawnTimer += dt;
	if (AsteroidSpawnTimer >= 1)
	{
		AsteroidSpawnTimer = 0;
		spawnAsteroid();
	}
		

	////////////////////////////////////////////////////////////
	//Bullet Movement
	//Moves and draws the Bullets if it's been fired
	for (var i = 0; i < Bullets.length; i++)
	{
		Bullets[i].x += Bullets[i].velocityX;
		Bullets[i].y += Bullets[i].velocityY;

		context.drawImage(Bullets[i].image,
						Bullets[i].x - Bullets[i].width/2,
						Bullets[i].y - Bullets[i].height/2);

		//checks if the Bullet is outside the screen
		if (Bullets[i].x > SCREEN_WIDTH || Bullets[i].x < 0 ||
			Bullets[i].y > SCREEN_HEIGHT || Bullets[i].y < 0)
		{
			Bullets.splice(i, 1); //removes it from out array
		}
		else //else checks if any of the bullets are hitting Asteroids
		{
			for (var j = 0; j < Asteroids.length; j++)
			{
				var hit = intersects(
								Bullets[i].x, Bullets[i].y,
								Bullets[i].width, Bullets[i].height,
								Asteroids[j].x, Asteroids[j].y,
								Asteroids[j].width, Asteroids[j].height);
				if (hit == true)
				{
					Bullets.splice(i,1);
					Asteroids.splice(j,1);
					break;
				}
			}
		}
	}
}

{
for (var j = 0; j < Asteroids.length; j++)
	
var hit = intersects
		(Player.x, Player.y,
		Player.width, Player.height,
		Asteroids[j].x, Asteroids[j].y,
		Asteroids[j].width, Asteroids[j].height);
	if (hit == true)


//Player.Dead = true
//gameState = STATE_GAMEOVER
};


function runEnd(dt)
{};
//callback function to run each frame
function run()
{
	//First we work out the difference in time between now and the last update
	//and chuck it into deltaTime
	var now = Date.now();
	var DeltaTime = (now - lastUpdate) * 0.001;
	lastUpdate = now;

	//Gray Background
	context.fillStyle = "#5C005C";
	context.fillRect(0, 0, canvas.width, canvas.height);

	//runs the current game state 
	switch (gameState)
	{
		case STATE_SPLASH:
			runSplash(DeltaTime);
			break;
		case STATE_GAME:
			runGame(DeltaTime);
			break;

		case STATE_GAMEOVER:
			runEnd(DeltaTime);
			break;
	}
};



//DUNNA TOUCH ME BOYOO
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

//essentially a function that sets our callback function run() to be called every frame
//with handling of different browsers
(function() {
	var onEachFrame;
	if (window.requestAnimationFrame) 
	{
		onEachFrame = function(cb) 
		{
			var _cb = function() 
			{ 
				cb(); //ie or chrome
				window.requestAnimationFrame(_cb); 
			}
		_cb();
		};
	}
	else if (window.mozRequestAnimationFrame)
	{
		onEachFrame = function(cb) 
		{
			var _cb = function() 
			{ 
				cb();	//mozilla
				window.mozRequestAnimationFrame(_cb); 
			}
		_cb();
		};
	}
	else 
	{
		onEachFrame = function(cb) //any ol browser
		{
			setInterval(cb, 1000 / 60);
		}
	}
	window.onEachFrame = onEachFrame;
})();

//call our function
window.onEachFrame(run);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
