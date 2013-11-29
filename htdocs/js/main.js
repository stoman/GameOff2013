var test;

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
    test = loader;
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
    var backgroundFar2Texture = PIXI.Texture.fromImage("img/github_game_off_2013_resized.png");
    var backgroundFar2 = new PIXI.TilingSprite(
	    backgroundFar2Texture,
	    2048,
	    512
    );
    backgroundFar2.position.x = 0;
    backgroundFar2.position.y = -150;
    backgroundFar2.tilePosition.x = 0;
    backgroundFar2.tilePosition.y = 0;
    stage.addChild(backgroundFar2);

    // far background 
    var backgroundFarTexture = PIXI.Texture.fromImage("img/background_far.png");
    var backgroundFar = new PIXI.TilingSprite(
	    backgroundFarTexture,
	    4*1024,
	    4*128
    );
    backgroundFar.position.x = 0;
    backgroundFar.position.y = canvas.height() - 4*128;
    backgroundFar.tilePosition.x = 0;
    backgroundFar.tilePosition.y = 0;
    stage.addChild(backgroundFar);
    
    // mid background
    var backgroundMidTexture = PIXI.Texture.fromImage("img/background_mid.png");
    var backgroundMid = new PIXI.TilingSprite(
	    backgroundMidTexture,
	    4*1024,
	    4*128
    );
    backgroundMid.position.x = 0;
    backgroundMid.position.y = canvas.height() - 4*128;
    backgroundMid.tilePosition.x = 0;
    backgroundMid.tilePosition.y = 0;
    stage.addChild(backgroundMid);

    // front background
    var backgroundFrontTexture = PIXI.Texture.fromImage("img/background_front.png");
    var backgroundFront = new PIXI.TilingSprite(
	    backgroundFrontTexture,
	    4*1024,
	    4*128
    );
    backgroundFront.position.x = 0;
    backgroundFront.position.y = canvas.height() - 4*128;
    backgroundFront.tilePosition.x = 0;
    backgroundFront.tilePosition.y = 0;
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