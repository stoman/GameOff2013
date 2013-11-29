var test;
var game = {
	"player": {
	    "x": 0,
	    "y": 0,
	    "speed": 1
	},
	"speed": 1,
	"ticks": 0
};

$(window).load(function() {
    // load assets
    var loader = new PIXI.AssetLoader([
       	"img/github_game_off_2013_resized.png",
    	"img/github_game_off_2013.png",
	"img/background_far.png",
	"img/background_mid.png",
	"img/background_front.png"
    ]);
    loader.addEventListener("onComplete", function(event) {
	// finished -> start game
	console.log("ready");
	initialize();
    });
    var loadCount = 0;
    loader.addEventListener("onProgress", function(event) {
	// loading progress
	console.log("loading... "+Math.round(100*++loadCount/5)+"%");
    });
    loader.load();
    console.log("loading...");
});

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
    var backgroundFar2 = test = createTilingSprite("img/github_game_off_2013_resized.png");
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

    // character
    var characterTexture = PIXI.Texture.fromImage("img/test.png");
    var character = new PIXI.Sprite(characterTexture);
    character.position.x = 100;
    character.position.y = 475;
    character.anchor.x = 0.5;
    character.anchor.y = 1;
    stage.addChild(character);
    
    // animate
    requestAnimFrame(animate);
    function animate() {
	// update positions
	//character.rotation += 0.01;
	backgroundFar2.tilePosition.x -= 0.9;
	backgroundFar.tilePosition.x -= 1.2;
	backgroundMid.tilePosition.x -= 1.8;
	backgroundFront.tilePosition.x -= 2.7;
	
	// render
	renderer.render(stage);
	requestAnimFrame(animate);
    }
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