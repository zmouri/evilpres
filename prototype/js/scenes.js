// loading screen
Crafty.scene("loading", function () {
    $('#interface').hide();

    //Bind click event on button
    $('#startbutton').live('click',function() {
    	$('#startscreen').fadeOut('slow', function() {
    		Crafty.audio.stop();
            Crafty.scene("main"); //when everything is loaded, run the main scene
            Crafty.e("Scroller");        		
    	});
    });

    // loading text
    var text = Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: WINDOW_WIDTH / 2 - 60, y: WINDOW_HEIGHT / 2 })
	                .text("Loading")
	                .css({ "text-align": "center" });
    
    //load takes an array of assets and a callback when complete
    Crafty.load([IMG_SPRITE, IMG_SKY], function () {
    	Crafty.audio.play("title", -1, 0.5);
        $('#startscreen').show();
        text.destroy();
    });
});


Crafty.scene("main", function () {
    var bars = {
        power: $('#power'),
        turn: $('#turn'),
    };
    bars.power.addClass('green');
    
    var info = {
        powerAmount: bars.power.find('.text'),
        turn: bars.turn.find('.text'),
    };

    $('#interface').show();
    generateWorld();
    addObstacles();
	
    //create our player entity with some premade components
    var player1 = Crafty.e("2D, DOM, Box2D, Character, player_bman, Mouse, PlayerControl, RangedAttacker, projectileAttacker")
            .attr({ x: 80, y: 250, z: 5 })
            .PlayerControl(2, 20)
            .RangedAttacker()
//            .BombDropper()
            .Character(1);
    
    var player2 = Crafty.e("2D, DOM, Box2D, Character, player_iman, Mouse, PlayerControl, lineOfSightAttacker")
	        .attr({ x: 800, y: 70, z: 5 })
            .PlayerControl(2, 4)
	        .Character(2);
    		
    player1.body.SetFixedRotation(true);
    player2.body.SetFixedRotation(true);
    
    // setup controls
    player1.disableControls = false;
    player2.disableControls = true;
//    Crafty.trigger("StartTurn", currentTurn);	// todo this isn't working, not sure why
    
    Crafty.bind("UpdatePower", function(player) {
    	info.powerAmount.text(player.powerAmount);
    });
    
    Crafty.bind("UpdateTurn", function() {
    	info.turn.text(currentTurn);
    });    	

    Crafty.bind("Firing", function(player) {
    	// bind new mouse events
        $(document).on('mousemove', {player: player}, checkFiring);
        $(document).on('mouseup', {player: player}, fireProjectile);
    });

    Crafty.bind("GameOver", function(loser) {
    	var winner = loser.playerNum === 1 ? 2 : 1;
        var text = Crafty.e("2D, DOM, Text").attr({ w: 300, h: 20, x: WINDOW_WIDTH / 2 - 60, y: WINDOW_HEIGHT / 2, z: 100 })
			            .text("Player " + loser.playerNum + " has died! Player " + winner + " has won! You are winner ha ha ha!")
			            .css({ "text-align": "center", "color": "black" });
    });

	Crafty.trigger("UpdateTurn");
	
    $(document).mousemove(function(event) {
		var translatedPosition = Crafty.DOM.translate(event.clientX, event.clientY);
    	$('#mousex .text').text(translatedPosition.x);
    	$('#mousey .text').text(translatedPosition.y);
    });
    
    // sometimes Crafty initializes with incorrect stage attributes, shifting the actual level
    // if this is the case when the scene first loads, reload the viewport
    if(Crafty.stage.x != 0 && Crafty.stage.y != 0) {
    	Crafty.viewport.reload();
    }
});

var checkFiring = function(event, player) {
	var player = event.data.player;
	var translatedPosition = Crafty.DOM.translate(event.clientX, event.clientY);
	
	if(player.isFiring) {
		// calculate distance between mouse cursor and player
		// x^2 + y^2 = z^2
		// the pixel distance is translated to "power" in increments of 20
		var distance = Math.sqrt(Math.pow(translatedPosition.x - player.x, 2) + Math.pow(translatedPosition.y - player.y, 2));
		if(distance > 100) {
			player.powerAmount = 5;
		}
		else {
			player.powerAmount = Math.floor(distance / 20);
		}
		
		// calculate color intensity based on power
		var intensity;
		switch(player.powerAmount) {
    		case 1:
    			intensity = "#0055bb";
    			break;
    		case 2:
    			intensity = "#00dd00";
    			break;
    		case 3:
    			intensity = "#ffff33";
    			break;
    		case 4:
    			intensity = "#ff8811";
    			break;
    		default:
    			intensity = "#bb0033";
		}


		// remove any existing slingshots and draw a new one
        var translatedAngle = Math.atan2(translatedPosition.y - player.y, translatedPosition.x - player.x);
		var rotationAngle = translatedAngle - Math.PI;	// rotation angle needs to be mapped to take into account the DOM origin
		Crafty("Slingshot").destroy();
		Crafty.e("Slingshot")
    		.Slingshot(player.x, player.y, distance, intensity)
    		.attach(Crafty.e("SlingshotAnchor").SlingshotAnchor(translatedPosition.x, translatedPosition.y, intensity))
    		.attach(Crafty.e("SlingshotArrow").SlingshotArrow(2 * (player.x) - translatedPosition.x - Crafty.viewport.x, 2 * (player.y) - translatedPosition.y - Crafty.viewport.y, rotationAngle, intensity));
    	
		Crafty.trigger("UpdatePower", player);

		// if the mouse is behind the character, swivel
		if(translatedPosition.x > player.x) {
			player.trigger("FaceNewDirection", -1);
		}
		else {
			player.trigger("FaceNewDirection", 1);
		}
		
//		console.log("angle: " + (translatedAngle * 180 / Math.PI));
//		console.log("actual angle: " + (rotationAngle * 180 / Math.PI));
	}
};

var fireProjectile = function(event) {
	var player = event.data.player;
	var translatedPosition = Crafty.DOM.translate(event.clientX, event.clientY);
	
	if(player.isFiring && player.powerAmount > 0) {
        var translatedAngle = Math.atan2(translatedPosition.y - player.y, translatedPosition.x - player.x);
		var rotationAngle = translatedAngle - Math.PI;	// rotation angle needs to be mapped to take into account the DOM origin
		console.log("firing at " + (rotationAngle * 180 / Math.PI));
		
		player.isFiring = false;
		if(player.has("projectileAttacker")) {
            var projectile = Crafty.e("2D, DOM, Box2D, ExplodingProjectile")
						            .attr({ x: player.x + player.faceDirection * 16, y: player.y, z: 2 })
						            .ExplodingProjectile("projectile", player);

            projectile.Throw(50 * player.powerAmount, rotationAngle);
		}
		else if(player.has("lineOfSightAttacker")) {
            var los = Crafty.e("2D, DOM, Box2D, LineOfSightAttack")
						            .attr({ x: player.x + player.faceDirection * 16, y: player.y - 16, z: 2 })
						            .LineOfSightAttack("lineofsight", player);

            los.Attack(50 * player.powerAmount, rotationAngle);
		}
		
		player.powerAmount = 0;
		Crafty.trigger("UpdatePower", player);
		
		// unbind mouse events and re-enable mouselook
        $(document).off('mousemove', checkFiring);
        $(document).off('mouseup', fireProjectile);
    	Crafty.viewport.mouselook(true);
    	
    	// remove slingshot
		Crafty("Slingshot").destroy();
		
		// end current turn
        endTurn();
	}
};