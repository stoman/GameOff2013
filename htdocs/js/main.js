$(window).load(function() {
    // setup renderer and stage
    var canvas = $("#game-canvas");
    var renderer = new PIXI.autoDetectRenderer(
	    canvas.width(),
	    canvas.height(),
	    canvas[0]
	    );
    var stage = new PIXI.Stage(0x66FF99);
    
    // far background
    var backgroundFarTexture = PIXI.Texture.fromImage("img/github_game_off_2013_resized.png");
    var backgroundFar = new PIXI.TilingSprite(
	    backgroundFarTexture,
	    2048,
	    512
    );
    backgroundFar.position.x = 0;
    backgroundFar.position.y = 0;
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
    
    // character
    var characterTexture = PIXI.Texture.fromImage("img/test.png");
    var character = new PIXI.Sprite(characterTexture);
    character.position.x = 100;
    character.position.y = 100;
    character.anchor.x = 0.5;
    character.anchor.y = 0.5;
    stage.addChild(character);
    
    // animate
    requestAnimFrame(animate);
    function animate() {
	// update positions
	character.rotation += 0.01;
	backgroundFar.tilePosition.x -= 0.5;
	backgroundMid.tilePosition.x -= 1;
	
	// render
	renderer.render(stage);
	requestAnimFrame(animate);
    }
});