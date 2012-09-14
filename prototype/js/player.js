var EXPLOSION_DAMAGE = 30;
var INITIAL_PLAYER_HP = 100;
var MAX_SPEED = 2;
var JUMP_FORCE = 800;
var DIRECTION = {
		LEFT : -1,
		RIGHT: 1,
};
var IMG_INDICATOR = "img/arrow.png";

Crafty.c('Character', {
	isFiring: false,
	powerAmount: 0,
	faceDirection: 0,
	playerNum: 0,
	teamNum: 0,
	hp: INITIAL_PLAYER_HP,
	hpBar : null,
	indicator : null,
	
	Character: function(playerNum, teamNum, spriteNum) {
		this.playerNum = playerNum;
		this.teamNum = teamNum;
		
        this.hpBar = Crafty.e("HPBarOuter")
		        		.attr({ x: this.x, y: this.y - 16, z: 10, w: this.w, h: 5 })
		        		.HPBarOuter()
		        		.SetHp(1);	// 100%
        
        this.indicator = Crafty.e("CurrentPlayerIndicator")
							.attr({ x: this.x, y: this.y - 32, z: 10, w: 16, h: 16 })
							.CurrentPlayerIndicator();
			
            //setup animations
        this.requires("SpriteAnimation, PlayerControl, Box2D")
            .animate("walk_left", 6, spriteNum, 8)
            .animate("walk_right", 9, spriteNum, 11)
            .animate("walk_up", 3, spriteNum, 5)
            .animate("walk_down", 0, spriteNum, 2)
            .attach(this.hpBar)
            .attach(this.indicator)
            .box2d({
            	bodyType: 'dynamic',
            	density: 1
            })
//	                .collision()
            //change direction when a direction change event is received
            .bind("NewDirection", function (direction) {
                if (direction.x < 0) {
                	this.faceDirection = DIRECTION.LEFT;
                    if (!this.isPlaying("walk_left"))
                        this.stop().animate("walk_left", 10, -1);
                }
                if (direction.x > 0) {
                	this.faceDirection = DIRECTION.RIGHT;
                    if (!this.isPlaying("walk_right"))
                        this.stop().animate("walk_right", 10, -1);
                }
                if (direction.y < 0) {
                    if (!this.isPlaying("walk_up"))
                        this.stop().animate("walk_up", 10, -1);
                }
                if (direction.y > 0) {
                    if (!this.isPlaying("walk_down"))
                        this.stop().animate("walk_down", 10, -1);
                }
                if(!direction.x && !direction.y) {
                    this.stop();
                }
            })
            .bind("FaceNewDirection", function (direction) {
                if (direction < 0 && this.faceDirection != DIRECTION.LEFT) {
                	this.faceDirection = DIRECTION.LEFT;
                    if (!this.isPlaying("walk_left"))
                        this.stop().animate("walk_left", 10, 1);
                }
                if (direction > 0 && this.faceDirection != DIRECTION.RIGHT) {
                	this.faceDirection = DIRECTION.RIGHT;
                    if (!this.isPlaying("walk_right"))
                        this.stop().animate("walk_right", 10, 1);
                }
            })
//	                .onHit("solid", function(hit) {
//	                    for (var i = 0; i < hit.length; i++) {
//	                        if (hit[i].normal.y !== 0) { // we hit the top or bottom of it
//	                            this._up = false;
//	                        }
//	
//	                        if (hit[i].normal.x === 1) { // we hit the right side of it
//	                            this.x = hit[i].obj.x + hit[i].obj.w;
//	                        }
//	
//	                        if (hit[i].normal.x === -1) { // we hit the left side of it
//	                            this.x = hit[i].obj.x - this.w;
//	                        }
//	                    }
//	                })
//                .onContact("explosion", function() {
//                    this.trigger("TakeDamage", [null, "explosion"]);	// TODO how do we get attacker here?
//                })
            .bind("StartTurn", function () {
//                if (this.playerNum === turnNum) {
                	this.addComponent("RangedAttacker")
//                    		.BombDropper()
                		.RangedAttacker();
                	
	    			this.disableControls = false;
	    			this.SetCurrentPlayer();
//                }
            })
            .bind("EndTurn", function () {
//                if (this.playerNum === turnNum) {
    	    		this.removeComponent("RangedAttacker")
    	    			.unbind('MouseDown');
    	    	    
	    			this.disableControls = true;
	    			this.UnsetCurrentPlayer();
//                }
            })
            .bind("SetHp", function(damage) {
            	var newHp = this.hp - damage.amount;
            	var attacker = damage.from;

    			this.hp = newHp;
            	console.log("player " + this.playerNum + " new hp: " + this.hp);
    			this.hpBar.SetHp(this.hp / INITIAL_PLAYER_HP);	// TODO make this more robust with multiple children
            	this.trigger("CheckDeath", attacker);
            })
            .bind("Drowned", function() {
            	console.log("player " + this.playerNum + " drowned");
            	this.trigger("SetHp", {amount: this.hp, from: this});
            })
            .bind("HitByExplosion", function (originalAttacker) {
            	console.log("player " + this.playerNum + " hit by explosion");
                this.trigger("TakeDamage", {attacker: originalAttacker, type: "explosion"});
            })
            .bind("TakeDamage", function (attack) {
            	var attacker = attack.attacker;
            	var attackType = attack.type;

            	console.log("player " + this.playerNum + " taking damage from " + attacker.playerNum);
                if (attackType === "explosion") {
                	// TODO reduce this by distance, and pass in ability instead of using constant
                	this.trigger("SetHp", {amount: EXPLOSION_DAMAGE, from: attacker});
                }
            })
            .bind("CheckDeath", function (attacker) {
                if (this.hp <= 0) {
                	console.log("player " + this.playerNum + " died");
                    destroyedBodies.push(this);
                    
                    Crafty.trigger("RemoveFromTeam", this);                	
                	Crafty.trigger("CheckGameOver");
                }
            });

		console.log("created player " + this.playerNum + " represented by entity " + this[0]);
        return this;
    },
    
    SetCurrentPlayer: function() {
    	// set visibility for both indicator and image
    	this.indicator.visible = true;
    	this.indicator._children[0].visible = true;
    	this.indicator._children[0].width = 16;
    	this.indicator._children[0].height = 16;
    	return this;
    },
    
    UnsetCurrentPlayer: function() {
    	// set visibility for both indicator and image
    	this.indicator.visible = false;
    	this.indicator._children[0].visible = false;
    	return this;
    },
});

Crafty.c("HPBarOuter", {    	
	init: function() {
		this.requires("2D, DOM, Color")
			.color("#000000");
		return this;
	},	

	HPBarOuter: function() {
		var inner = Crafty.e("HPBarInner")
						.attr({x: this.x, y: this.y, z: this.z, w: this.w, h: this.h})
						.SetBarWidth(this.w);
		
		this.attach(inner);
		return this;
	},
	
	SetHp: function(hp) {
		this._children[0].HPBarInner(hp);
		return this;
	}
});

Crafty.c("HPBarInner", {
	barWidth : 16,
	
	init: function() {
		this.requires("2D, DOM, Color")
			.color("#009900");
		return this;
	},
	
	SetBarWidth: function(width) {
		this.barWidth = width;
		return this;
	},
    
	HPBarInner: function(hpPercent) {
		this.w = hpPercent * this.barWidth;
		if(hpPercent > .51) {
			this.color("#009900");
		}
		else if(hpPercent < .51) {
			this.color("#CC9900");
		}
		else if(hpPercent < .21) {
			this.color("#990000");
		}
		return this;
	}
});

Crafty.c("CurrentPlayerIndicator", {    	
	init: function() {
		this.requires("2D, DOM");
		return this;
	},	

	CurrentPlayerIndicator: function() {
		var image = Crafty.e("2D, DOM, Image")
						.attr({x: this.x, y: this.y, z: this.z})
						.image(IMG_INDICATOR);
		
		this.attach(image);
		return this;
	},
});

Crafty.c('RangedAttacker', {
    RangedAttacker: function() {
        this.requires('Mouse')
            .bind("MouseDown", function(e) {
	    		if(e.mouseButton == Crafty.mouseButtons.LEFT) {
		    		this.isFiring = true;
		    		this.powerAmount = 0;
		    		
		        	Crafty.trigger("Firing", this);
		        	
		    		// disable mouse look
		            Crafty.viewport.mouselook(false);
		            
		            // TODO need to disable movement
	    		}
            });
        
        return this;
    },
});

Crafty.c("PlayerControl", {    	
    init: function() {
        this.requires('Keyboard');
    },
    
    PlayerControl: function(speed, jumpSpeed) {
    	this.speed = speed;
    	this.jumpSpeed = jumpSpeed;
		this.isJumping = false;

		this.bind("EnterFrame", function() {
			if (this.disableControls) {
				return;
			}

			
			var dx = 0;
			var dy = 0;				
			if (this.isDown("D")) {
				this.trigger('NewDirection', {x: DIRECTION.RIGHT, y: 0});
				if(this.body.GetLinearVelocity().x < MAX_SPEED) {
					dx = this.speed;						
				}
			}
			else if (this.isDown("A")) {
				this.trigger('NewDirection', {x: DIRECTION.LEFT, y: 0});
				if(this.body.GetLinearVelocity().x > -1 * MAX_SPEED) {
					dx = -1 * this.speed;
				}
			}
			else {
				this.trigger('NewDirection', {x: 0, y: 0});
			}
			
			// can't jump unless vertical linear velocity is 0
			if (this.body.GetLinearVelocity().y === 0 && this.isDown("W")) {
				dy = this.body.GetMass() * JUMP_FORCE;
			}

			if(dx !== 0 || dy !== 0) {
				return this.body.ApplyImpulse(new b2Vec2(dx/PIXEL2METER_RATIO, dy/PIXEL2METER_RATIO), this.body.GetWorldCenter());
			}
		});
		
		return this;
    },
});

function endTurn() {
	getCurrentPlayer().trigger("EndTurn");

	currentTeam++;
	if(currentTeam >= teams.length) {
		currentTeam = 0;
	}
	
	var currentPlayerNum = getCurrentPlayerNum() + 1;
	if(currentPlayerNum >= teams[currentTeam].players.length) {
		currentPlayerNum = 0;
	}
	setCurrentPlayerNum(currentPlayerNum);
}

function getCurrentPlayerNum() {
	return teams[currentTeam].currentPlayerNum;
}

function setCurrentPlayerNum(playerNum) {
	teams[currentTeam].currentPlayerNum = playerNum;
}

function getCurrentPlayer() {
	return teams[currentTeam].players[getCurrentPlayerNum()];
}