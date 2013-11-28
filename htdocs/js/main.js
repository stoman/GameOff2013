$(function() {
    var stage = new PIXI.Stage(0x66FF99);
    var canvas = $("#game-canvas");
    var renderer = new PIXI.autoDetectRenderer(canvas.width(), canvas.height(), canvas[0]);
    renderer.render(stage);
});