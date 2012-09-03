var currentTurn = 1;
var destroyedBodies = [];
var queuedBodies = [];
	
$(document).ready(function () {	
	//start crafty
	Crafty.init(WINDOW_WIDTH, WINDOW_HEIGHT);
	Crafty.canvas.init();
    Crafty.canvas._canvas.style.zIndex = '3000';
    Crafty.box2D.init(0, GRAVITY, PIXEL2METER_RATIO, true);
    
    Crafty.box2D.world.SetContactListener(contactListener);
//    Crafty.box2D.showDebugInfo();
    
    Crafty.viewport.mouselook(true);
    
//    $(this).mousewheel(function(event, delta) {
//    	Crafty.viewport.zoom(delta, 0, 0, 5);
//    });
    
    $('#start').show();
    $('#cr-stage').hide();
	$('#start').click(function() {
	    $(this).hide();
	    $('#cr-stage').show();
	    Crafty.scene("loading");
	});
});