// global variables
var canvas;
var renderer;
var stage;
var game;

// preloader
$(document).ready(function() {
    // load assets
    var loader = test = new PIXI.AssetLoader([
        // background
       	"img/github_game_off_2013_resized.png",
	"img/background_far.png",
	"img/background_mid.png",
	"img/background_front.png",
	
	// splash screens
    	"img/github_game_off_2013.png",
    	"img/jquery.png",
    	"img/pixi.js.png",

    	// sprites
    	"img/sprites.json"
    ]);
    loader.addEventListener("onComplete", function(event) {
	// finished -> start game
	var time = 100;//final: 2000;
	$("#loading").fadeOut(time, function() {
	    $("#splash1").fadeIn(time, function() {
		setTimeout(function() {
		    showInstructions();
		    $("#splash1").fadeOut(time, function() {
			    $("#splash2").fadeIn(time, function() {
				setTimeout(function() {
				    $("#splash2").fadeOut(time, function() {
					$("#game-canvas").fadeIn(time);
				    });
				}, 1.5*time);
			    });
		    });
		}, time);
	    });
	});
    });
    var loadCount = 0;
    loader.addEventListener("onProgress", function(event) {
	// loading progress
	$("#loading p").html(
		Math.round(100*++loadCount/loader.assetURLs.length)+"%"
	);
    });
    loader.load();
    $("#js-error").hide();
    $("#loading").show();
});
   
$(window).load(function() {
    // setup renderer and stage
    canvas = $("#game-canvas");
    renderer = new PIXI.autoDetectRenderer(
	    canvas.width(),
	    canvas.height(),
	    canvas[0]
    );
});

/**
 * This function runs the game. It creates the renderer, the stage, the sprites
 * and so on.
 */
function initialize() {
    // game data
    game = {
    	"player": {
    	    "position": {
    		"x": 0,
    		"y": 0
    	    },
    	    "speed": {
    		"x": 1,
    		"y": 0
    	    },
    	    "isJumping": false,
    	    "doubleJumpAvailable": true,
    	    "sprite": null
    	},
    	"arrows": [],
    	"waiters": [],
    	"followingWaiter": {
    	    "position": {
    		"x": -170,
    		"y": 0
    	    },
    	    "speed": {
    		"x": 1,
    		"y": 0
    	    },
    	    "isJumping": false,
    	"doubleJumpAvailable": true,
    	    "sprite": null
    	},
    	"speed": 2,
    	"ticks": 0,
    	"score": 0,
    	"running": false
    };

    // setup renderer and stage
    stage = new PIXI.Stage(0x66FF99);
    
    // far background 2
    var backgroundFar2 = createTilingSprite("img/github_game_off_2013_resized.png");
    backgroundFar2.position.y = -150;
    stage.addChild(backgroundFar2);

    // far background 
    var backgroundFar = createTilingSprite("img/background_far.png");
    backgroundFar.position.y = canvas.height() - backgroundFar.height;
    stage.addChild(backgroundFar);
    
    // mid background
    var backgroundMid = createTilingSprite("img/background_mid.png");
    backgroundMid.position.y = canvas.height() - backgroundMid.height;
    stage.addChild(backgroundMid);

    // front background
    var backgroundFront = createTilingSprite("img/background_front.png");
    backgroundFront.position.y = canvas.height() - backgroundFront.height;
    stage.addChild(backgroundFront);

    // player
    var playerFrames = [
    	"player_stand.png",
    	"player_run1f.png",
    	"player_run2f.png",
    	"player_run1f.png",
    	"player_stand.png",
    	"player_run1b.png",
    	"player_run2b.png",
    	"player_run1b.png"
    ];
    var playerTextures = [];
    for(var i = 0; i < playerFrames.length; i++) {
	playerTextures.push(PIXI.Texture.fromFrame(playerFrames[i]));
    }
    game.player.sprite = new PIXI.MovieClip(playerTextures);
    game.player.sprite.gotoAndPlay(0);
    game.player.sprite.anchor.x = 0.5;
    game.player.sprite.anchor.y = 1;
    stage.addChild(game.player.sprite);
    
    // followingWaiter
    var followingWaiterFrames = [
    	"waiter_stand.png",
    	"waiter_run1f.png",
    	"waiter_run2f.png",
    	"waiter_run1f.png",
    	"waiter_stand.png",
    	"waiter_run1b.png",
    	"waiter_run2b.png",
    	"waiter_run1b.png"
    ];
    var followingWaiterTextures = [];
    for(var i = 0; i < followingWaiterFrames.length; i++) {
	followingWaiterTextures.push(PIXI.Texture.fromFrame(followingWaiterFrames[i]));
    }
    game.followingWaiter.sprite = new PIXI.MovieClip(followingWaiterTextures);
    game.followingWaiter.sprite.gotoAndPlay(0);
    game.followingWaiter.sprite.anchor.x = 0.5;
    game.followingWaiter.sprite.anchor.y = 1;
    stage.addChild(game.followingWaiter.sprite);
    
    // arrows
    game.arrows = [nextArrow()];
    stage.addChild(game.arrows[0].sprite);
    
    // waiters
    game.waiters = [nextWaiter()];
    stage.addChild(game.waiters[0].sprite);
    
    var scoreText = new PIXI.Text("", {
	font: "bold italic 36px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7
    });
    scoreText.position.x = 10;
    scoreText.position.y = 10;
    stage.addChild(scoreText);
    
    game.running = true;

    // animate
    requestAnimFrame(animate);
    function animate() {
	//compute score
	game.score += Math.sqrt(10000 + game.player.position.x) / 1000;
	scoreText.setText("Score: "+Math.floor(game.score));
	
	// handle user input
	game.player.isJumping = mouseDown || keysPressed.indexOf(32) > -1;
	game.followingWaiter.isJumping = false;
	if(game.followingWaiter.position.y < 150) {
        	game.waiters.forEach(function(waiter) {
        	    if(waiter.position.x > game.followingWaiter.position.x && waiter.position.x < game.followingWaiter.position.x - 150 * waiter.speed.x) {
        		game.followingWaiter.isJumping = true;
        	    }
        	});
	}
	
	// jump
	game.waiters.concat([game.player, game.followingWaiter]).forEach(function(agent) {
        	if(agent.isJumping) {
        	    // first jump
        	    if(agent.position.y == getGroundHeight(agent.position.x)) {
        		agent.speed.y = 3.5;
        	    }
        	    // second jump
        	    if(agent.speed.y < 0 && agent.doubleJumpAvailable) {
        		agent.speed.y = 3.5;
        		agent.doubleJumpAvailable = false;
        	    }
        	}
	});
	
	// update arrows
	if(game.arrows[game.arrows.length-1].sprite.position.x <= renderer.width) {
	    game.arrows.push(nextArrow());
	    stage.addChild(game.arrows[game.arrows.length-1].sprite);
	}
	if(game.arrows[0].sprite.position.x <= -renderer.width) {
	    game.arrows.slice(0, 1);
	}
	
	// detect arrow collisions
	for(var i = 0; i < game.arrows.length; i++) {
	    if(Math.abs(game.player.position.x - game.arrows[i].position.x) < 100 && Math.abs(game.player.position.y - game.arrows[i].position.y) < 100) {
	    game.score += 10;
		if(game.arrows[i].type == "vertical") {
			// jump
			game.player.speed.y = 2.6;
		}
		else {
			// run
			game.player.speed.x = 2;
		}
	    }
	}
	
	// update waiters
	if(game.waiters[game.waiters.length-1].sprite.position.x <= renderer.width) {
	    game.waiters.push(nextWaiter());
	    stage.addChild(game.waiters[game.waiters.length-1].sprite);
	}
	if(game.waiters[0].sprite.position.x <= -renderer.width) {
	    game.waiters.slice(0, 1);
	}
	
	// detect waiter collisions
	for(var i = 0; i < game.waiters.length; i++) {
	    if(Math.abs(game.player.position.x - game.waiters[i].position.x) < 50 && Math.abs(game.player.position.y - game.waiters[i].position.y) < 100) {
		game.running = false;
		showGameOver();
	    }
	}
	
	// update player position
	if(game.ticks % 1000 == 0) {
	    game.speed *= 1.1;
	}
	game.player.speed.x += (1 - game.player.speed.x) / 300; 
	game.followingWaiter.speed.x = game.player.speed.x;
	game.waiters.concat([game.player, game.followingWaiter]).forEach(function(agent) {
		agent.speed.y -= game.speed/40; 
		agent.position.x += agent.speed.x * game.speed;
		agent.position.y += agent.speed.y * game.speed;
		if(agent.position.y <= getGroundHeight(agent.position.x && agent.speed.y < 0)) {
		    agent.speed.y = 0;
		    agent.position.y = getGroundHeight(agent.position.x);
		    agent.doubleJumpAvailable = true;
		}
	
		// reposition agents
		agent.sprite.position.x = 200 + agent.position.x - game.player.position.x;
		agent.sprite.position.y = 475 - agent.position.y;
		agent.sprite.animationSpeed = Math.abs(agent.speed.x) * game.speed / 15;
	});
		
	// reposition arrows
	for(var i = 0; i < game.arrows.length; i++) {
		game.arrows[i].sprite.animationSpeed = game.speed / 10;
		game.arrows[i].sprite.position.x = game.player.sprite.position.x - game.player.position.x + game.arrows[i].position.x;
		game.arrows[i].sprite.position.y = game.player.sprite.position.y + game.player.position.y - game.arrows[i].position.y;
	}
	
	// reposition background
	backgroundFar2.tilePosition.x = game.player.position.x * -0.5;
	backgroundFar.tilePosition.x = game.player.position.x * -0.85;
	backgroundMid.tilePosition.x = game.player.position.x * -1.0;
	backgroundFront.tilePosition.x = game.player.position.x * -1.15;
	
	// render
	renderer.render(stage);
	
	// go to next tick
	if(game.running) {
	    requestAnimFrame(animate);
	}
	game.ticks++;
    }
}

/**
 * This function returns the height of the ground at the player's current
 * position.
 * @param x is the x-coordinate of the position to ask for
 * @returns the height at the player's current position
 */
function getGroundHeight(x) {
    return 0;//TODO
}

/**
 * This function loads a TilingSprite from a given path. The image should be
 * preloaded by the asset loader in advance.
 * @param path is the path to the texture image
 * @returns a new PIXI.TilingSprite
 */
function createTilingSprite(path) {
    // load texture
    var texture = PIXI.Texture.fromImage(path);
    
    // create sprite
    var sprite = new PIXI.TilingSprite(
	    texture,
	    texture.width,
	    texture.height
    );
        
    // return
    return sprite;
}

/**
 * This function computes the next arrow to show to the user.
 * @returns an object describing the arrow, the sprite is contained in the key
 * "sprite"
 */
function nextArrow() {
    var x = game.arrows.length == 0 ? game.player.position.x + 700 : 
	game.arrows[game.arrows.length-1].position.x
    	+ 300 + pseudoRandom(
    		todaySeed(),
    		game.arrows[game.arrows.length-1].position.x + 1,
    		1200
    ); 
    var type = x % 4 < 2 ? "vertical" : "horizontal";

    // create arrow
    var arrowTextures = [];
    for(var i = 1; i <= 9; i++) {
	arrowTextures.push(PIXI.Texture.fromFrame("arrow"+(type == "horizontal" ? "h" : "")+i+".png"));
    }
    var arrow = new PIXI.MovieClip(arrowTextures);
    arrow.gotoAndPlay(0);
    arrow.anchor.x = 0.5;
    arrow.anchor.y = 1;
    
    // create return value
    return {
	"sprite": arrow,
	"type": type,
	"position": {
	    "x": x,
	    "y": 150
	}
    };
}

/**
 * This function computes the next waiter to try to catch the user.
 * @returns an object describing the waiter, the sprite is contained in the key
 * "sprite"
 */
function nextWaiter() {
    // create waiter
    var waiterFrames = [
     	"waiter2_stand.png",
     	"waiter2_run1f.png",
     	"waiter2_run2f.png",
     	"waiter2_run1f.png",
     	"waiter2_stand.png",
     	"waiter2_run1b.png",
     	"waiter2_run2b.png",
     	"waiter2_run1b.png"
    ];
    var waiterTextures = [];
    for(var i = 0; i < waiterFrames.length; i++) {
 	waiterTextures.push(PIXI.Texture.fromFrame(waiterFrames[i]));
    }
    var waiter = new PIXI.MovieClip(waiterTextures);
    waiter.gotoAndPlay(0);
    waiter.anchor.x = 0.5;
    waiter.anchor.y = 1;
    
    // create return value
    var x = game.waiters.length == 0 ? game.player.position.x + 1000 : 
	game.waiters[game.waiters.length-1].position.x
    	+ 500 + pseudoRandom(
    		todaySeed(),
    		game.waiters[game.waiters.length-1].position.x + 1,
    		Math.ceil(10000 / game.speed)
    );
    return {
	"sprite": waiter,
	"position": {
	    "x": x,
	    "y": 0
	},
	"speed": {
	    "x": Math.min(-1.1, -Math.sqrt(Math.sqrt(game.speed))),
	    "y": 0
	},
	"isJumping": false,
	"doubleJumpAvailable": true
    };
}

// user input
var keysPressed = [];
var mouseDown = false;

// handle user input
document.onkeydown = function(event) {
    keysPressed.push(event.keyCode);
    return event.keyCode != 32;
};
document.onkeyup = function(event) {
    while(-1 < keysPressed.indexOf(event.keyCode)) {
	keysPressed.splice(keysPressed.indexOf(event.keyCode), 1);
    }
    if(event.keyCode == 32 && (game == null || !game.running)) {
	initialize();
    }
    return event.keyCode != 32;
};
document.onmousedown = function() {
    mouseDown = true;
};
document.onmouseup = function() {
    mouseDown = false;
    if(game == null || !game.running) {
	initialize();
    }
};

/**
 * This function generates deterministically a pseudo-random number between 0
 * and max-1.
 * @param seed is the seed to use
 * @param nr is the number of the query. This can be used as a part of the seed
 * @param max is the modulo
 * @returns a pseudo-random number
 */
function pseudoRandom(seed, nr, max) {
    return (
    		2 * nr
        	+ 7 * (Math.pow(seed, 1) % max) * nr
        	+ 13 * (Math.pow(seed, 2) % max) * nr
        	+ 5 * (Math.pow(seed, 3) % max) * nr
    	) % max;
}

/**
 * This function generates a seed for random generators that depends on the
 * current date only by concatenating todays day, month and year.
 * @returns a random seed
 */
function todaySeed() {
    today = new Date();
    return today.getDay() + 100 * today.getMonth() + 10000 * today.getYear();
}

/**
 * This function is called when the player has died. The score and some
 * comments will be displayed.
 */
function showGameOver() {
    //add gray layer
    var layer = new PIXI.Graphics();
    layer.lineStyle(0);
    layer.beginFill(0xc0c0c0, 0.7);
    layer.moveTo(0, 0);
    layer.lineTo(renderer.width, 0);
    layer.lineTo(renderer.width, renderer.height);
    layer.lineTo(0, renderer.height);
    layer.endFill();
    stage.addChild(layer);
    
    //add title
    var titleText = new PIXI.Text("Damn! They took your\nloose change as a tip.", {
	font: "bold italic 40px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    titleText.position.x = renderer.width/2;
    titleText.position.y = 100;
    titleText.anchor.x = 0.5;
    stage.addChild(titleText);

    //add score
    var scoreText = new PIXI.Text("Final Score: "+Math.floor(game.score), {
	font: "bold italic 75px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    scoreText.position.x = renderer.width/2;
    scoreText.position.y = 250;
    scoreText.anchor.x = 0.5;
    stage.addChild(scoreText);

    //add play again
    var againText = new PIXI.Text("Click or press space\nto restart the game.", {
	font: "bold italic 40px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    againText.position.x = renderer.width/2;
    againText.position.y = 400;
    againText.anchor.x = 0.5;
    stage.addChild(againText);
}

/**
 * This functions displays some instructions for the game.
 */
function showInstructions() {
    initialize();
    game.running = false;
    
    //add gray layer
    var layer = new PIXI.Graphics();
    layer.lineStyle(0);
    layer.beginFill(0xc0c0c0, 0.85);
    layer.moveTo(0, 0);
    layer.lineTo(renderer.width, 0);
    layer.lineTo(renderer.width, renderer.height);
    layer.lineTo(0, renderer.height);
    layer.endFill();
    stage.addChild(layer);
    
    // player
    var player = new PIXI.Sprite.fromFrame("player_stand.png");
    player.position.x = 30;
    player.position.y = 50;
    stage.addChild(player);
    
    // followingWaiter
    var waiter = new PIXI.Sprite.fromFrame("waiter2_stand.png");
    waiter.position.x = 550;
    waiter.position.y = 240;
    stage.addChild(waiter);

    //add hint1
    var hint1Text = new PIXI.Text("This is you.\nYou were dining at a good restaurant.\nNow, you want to keep your loose\nchange and avoid tips.", {
	font: "bold italic 30px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    hint1Text.position.x = renderer.width/2 + 50;
    hint1Text.position.y = 20;
    hint1Text.anchor.x = 0.5;
    stage.addChild(hint1Text);

    //add hint2
    var hint2Text = new PIXI.Text("These are the waiters.\nThey want your well-earned money,\nso try to escape them.", {
	font: "bold italic 30px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    hint2Text.position.x = renderer.width/2 - 50;
    hint2Text.position.y = 240;
    hint2Text.anchor.x = 0.5;
    stage.addChild(hint2Text);

    //add hint3
    var hint3Text = new PIXI.Text("Click or press space to jump and double jump.\nCollect as many points and power-ups as possible!", {
	font: "bold italic 30px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    hint3Text.position.x = renderer.width/2;
    hint3Text.position.y = 400;
    hint3Text.anchor.x = 0.5;
    stage.addChild(hint3Text);

    //add play again 
    var againText = new PIXI.Text("Click or press space to start the game.", {
	font: "bold italic 40px Arvo",
	fill: "#253d48",
	stroke: "#ffffff",
	strokeThickness: 7,
	align: "center"
    });
    againText.position.x = renderer.width/2;
    againText.position.y = 500;
    againText.anchor.x = 0.5;
    stage.addChild(againText);
}