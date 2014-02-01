var kongregate;
var num_coins = 0;
kongregateAPI.loadAPI(onComplete);

function onComplete(){
	kongregate = kongregateAPI.getAPI();
	kongregate.stats.submit("GameStarted", 1);//max
	
	document.addEventListener("enemyAvoided", function() {
		kongregate.stats.submit("EnemiesAvoided", 1);//add
	}, false);

	document.addEventListener("gameFinished", function(e) {
		kongregate.stats.submit("GamesPlayed", 1);//add
		kongregate.stats.submit("Highscore", e.detail);//max
		kongregate.stats.submit("TotalScore", e.detail);//add
		num_coins = 0;
	}, false);

	document.addEventListener("coinCollected", function() {
		num_coins++;
		kongregate.stats.submit("CoinsCollected", num_coins);//max
		kongregate.stats.submit("TotalCoinsCollected", 1);//add
	}, false);

	document.addEventListener("jumped", function() {
		kongregate.stats.submit("Jumps", 1);//add
	}, false);

	document.addEventListener("doubleJumped", function() {
		kongregate.stats.submit("Jumps", 1);//add
		kongregate.stats.submit("DoubleJumps", 1);//add
	}, false);

}