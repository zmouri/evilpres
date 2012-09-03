var EXPLOSION_DAMAGE = 30;
var INITIAL_PLAYER_HP = 100;
var MAX_SPEED = 2;
var JUMP_FORCE = 800;
var DIRECTION = {
		LEFT : -1,
		RIGHT: 1,
};

Crafty.c('Character', {
	isFiring: false,
	powerAmount: 0,
	faceDirection: 0,
	playerNum: 0,
	hp: INITIAL_PLAYER_HP,
	hpBar : null,
	
	Character: function(num) {
		this.playerNum = num;

        this.hpBar = Crafty.e("HPBarOuter")
		        		.attr({ x: this.x, y: this.y - 16, z: this.z, w: this.w, h: 5 })
		        		.HPBarOuter()
		        		.SetHp(1);	// 100%
			
            //setup animations
        this.requires("SpriteAnimation, PlayerControl, Box2D")
            .animate("walk_left", 6, this.playerNum + 2, 8)
            .animate("walk_right", 9, this.playerNum + 2, 11)
            .animate("walk_up", 3, this.playerNum + 2, 5)
            .animate("walk_down", 0, this.playerNum + 2, 2)
            .attach(this.hpBar)
            .box2d({
            	bodyType: 'dynamic',
            	density: 1
            })
//	                .collision()
            //change direction when a direction change event is received
            .bind("NewDirection",
                function (direction) {
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
            .bind("FaceNewDirection",
                    function (direction) {
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
            .bind("StartTurn", function (turnNum) {
                if (this.playerNum === turnNum) {
                	this.addComponent("RangedAttacker")
//                    		.BombDropper()
                		.RangedAttacker();
                	
	    			this.disableControls = false;
                }
            })
            .bind("EndTurn", function (turnNum) {
                if (this.playerNum === turnNum) {
    	    		this.removeComponent("RangedAttacker")
    	    			.unbind('MouseDown');
    	    	    
	    			this.disableControls = true;
                }
            })
            .bind("SetHp", function(args) {
            	var newHp = args[0];
            	var attacker = args[1];

    			this.hp = newHp;
            	console.log("player " + this.playerNum + " new hp: " + this.hp);
    			this.hpBar.SetHp(this.hp / INITIAL_PLAYER_HP);	// TODO make this more robust with multiple children
            	this.trigger("CheckDeath", attacker);
            })
            .bind("Drowned", function() {
            	console.log("player " + this.playerNum + " drowned");
            	this.trigger("SetHp", [0, this]);
            })
            .bind("HitByExplosion", function (attacker) {
            	console.log("player " + this.playerNum + " hit by explosion");
                this.trigger("TakeDamage", [attacker, "explosion"]);
            })
            .bind("TakeDamage", function (args) {
            	var attacker = args[0];
            	var attackType = args[1];

            	console.log("player " + this.playerNum + " taking damage from " + attacker.playerNum);
                if (attackType === "explosion") {
                	// TODO reduce this by distance, and pass in ability instead of using constant
                	this.trigger("SetHp", [this.hp - EXPLOSION_DAMAGE, attacker]);
                }
            })
            .bind("CheckDeath", function (attacker) {
                if (this.hp <= 0) {
                	console.log("player " + this.playerNum + " died");
                    destroyedBodies.push(this);
                	
                	Crafty.trigger("GameOver", this);
                }
            });

		console.log("created player " + this.playerNum + " represented by entity " + this[0]);
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
	Crafty.trigger("EndTurn", currentTurn);
	
	currentTurn++;
	if(currentTurn > MAX_PLAYERS) {
		currentTurn = 1;
	}
	Crafty.trigger("UpdateTurn");
	
	Crafty.trigger("StartTurn", currentTurn);
}