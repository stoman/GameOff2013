var test;

// game data
var game = {
	"player": {
	    "position": {
		"x": 0,
		"y": 0
	    },
	    "speed": {
		"x": 1,
		"y": 0
	    }
	},
	"arrows": [],
	"speed": 2,
	"ticks": 0
};

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
	initialize();
	var time = 0;//final: 2000;
	$("#loading").fadeOut(time, function() {
	    $("#splash1").fadeIn(time, function() {
		setTimeout(function() {
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

/**
 * This function runs the game. It creates the renderer, the stage, the sprites
 * and so on.
 */
function initialize() {    
    // setup renderer and stage
    var canvas = $("#game-canvas");
    var renderer = new PIXI.autoDetectRenderer(
	    canvas.width(),
	    canvas.height(),
	    canvas[0]
	    );
    var stage = new PIXI.Stage(0x66FF99);
    
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
    var player = new PIXI.MovieClip(playerTextures);
    player.gotoAndPlay(0);
    player.anchor.x = 0.5;
    player.anchor.y = 1;
    stage.addChild(player);
    
    // arrows
    game.arrows = [nextArrow()];
    stage.addChild(game.arrows[0].sprite);
    
    // animate
    requestAnimFrame(animate);
    function animate() {
	// handle user input
	if(mouseDown || keysPressed.indexOf(32) > -1) {
	    if(game.player.position.y == getGroundHeight()) {
		game.player.speed.y = 3.5;
	    }
	}
	
	// update arrows
	if(game.arrows[game.arrows.length-1].sprite.position.x <= renderer.width) {
	    game.arrows.push(nextArrow());
	    stage.addChild(game.arrows[game.arrows.length-1].sprite);
	}
	if(game.arrows[0].sprite.position.x <= -renderer.width) {
	    game.arrows.slice(0, 1);
	}
	for(var i = 0; i < game.arrows.length; i++) {
	    if(Math.abs(game.player.position.x - game.arrows[i].position.x) < 100 && Math.abs(game.player.position.y - game.arrows[i].position.y) < 100) {
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
	
	// update player position
	if(game.ticks % 1000 == 0) {
	    game.speed *= 1.1;
	}
	game.player.speed.x += (1 - game.player.speed.x) / 300; 
	game.player.speed.y -= game.speed/40; 
	game.player.position.x += game.player.speed.x * game.speed;
	game.player.position.y += game.player.speed.y * game.speed;
	if(game.player.position.y <= getGroundHeight()) {
	    game.player.speed.y = 0;
	    game.player.position.y = getGroundHeight();
	}
	
	// reposition player
	player.position.x = 200;
	player.position.y = 475 - game.player.position.y;
	player.animationSpeed = game.player.speed.x * game.speed / 15;
	
	// reposition arrows
	for(var i = 0; i < game.arrows.length; i++) {
		game.arrows[i].sprite.animationSpeed = game.speed / 10;
		game.arrows[i].sprite.position.x = player.position.x - game.player.position.x + game.arrows[i].position.x;
		game.arrows[i].sprite.position.y = player.position.y + game.player.position.y - game.arrows[i].position.y;
	}
	
	// reposition background
	backgroundFar2.tilePosition.x = game.player.position.x * -0.5;
	backgroundFar.tilePosition.x = game.player.position.x * -0.85;
	backgroundMid.tilePosition.x = game.player.position.x * -1.0;
	backgroundFront.tilePosition.x = game.player.position.x * -1.15;
	
	// render
	renderer.render(stage);
	
	// go to next tick
	requestAnimFrame(animate);
	game.ticks++;
    }
}

/**
 * This function returns the height of the ground at the player's current
 * position.
 * @returns the height at the player's current position
 */
function getGroundHeight() {
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
    type = game.ticks % 2 == 0 ? "vertical" : "horizontal";
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
	    "x": game.player.position.x + 1000,
	    "y": 150
	}
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
    return event.keyCode != 32;
};
document.onmousedown = function() {
    mouseDown = true;
};
document.onmouseup = function() {
    mouseDown = false;
};