$(document).ready(function () {
	var IMG_SPRITE = "img/sprite_bman.png";
	var IMG_SKY = "img/Sky_back_layer.png";
	var IMG_EXPLOSION = "img/explosion.png";
	
	var GROUND_HEIGHT = 100;
	var EXPLOSION_RADIUS = 70;
	var MAX_PLAYERS = 2;
	
	var DIRECTION = {
			LEFT : -1,
			RIGHT: 1,
	};
	
	var currentTurn = 1;
	
	// get the browser window size
	var WINDOW_HEIGHT = 400;	//$(window).height();
	var WINDOW_WIDTH = $(window).width();
	
	//start crafty
	Crafty.init(WINDOW_WIDTH, WINDOW_HEIGHT);
	Crafty.canvas.init();
    Crafty.canvas._canvas.style.zIndex = '9000';

    //turn the sprite map into usable components
    Crafty.sprite(16, IMG_SPRITE, {
        grass1: [0, 0],
        grass2: [1, 0],
        grass3: [2, 0],
        grass4: [3, 0],
        flower: [0, 1],
        bush: [0, 2],
        player: [0, 3],
        enemy: [0, 3],
        projectile: [4, 0],
        empty: [4, 0],
    });
	
    function generateWorld() {
        //loop through all tiles
        for (var tileX = 0; tileX < WINDOW_WIDTH / 16; tileX++) {
            for (var tileY = 0; tileY < WINDOW_HEIGHT / 16; tileY++) {
            	
                // place grass on all tiles
        		createBaseTile(tileX * 16, WINDOW_HEIGHT - GROUND_HEIGHT + tileY * 16, 1);
                
                // flowers and bushes on the top ground layer minus obstacles
            	// TODO remove hardcoding
                if(tileY === 0 && (tileX > 15) && (tileX < 31 || tileX > 40) && (tileX < 54 || tileX > 63)) {
                	createSurfaceTile(tileX * 16, WINDOW_HEIGHT - GROUND_HEIGHT + tileY * 16, 2);
                }
            }
        }
    }
    
    function endTurn() {
		Crafty.trigger("EndTurn", currentTurn);
		
    	currentTurn++;
    	if(currentTurn > MAX_PLAYERS) {
    		currentTurn = 1;
    	}
		Crafty.trigger("UpdateTurn");
    	
		Crafty.trigger("StartTurn", currentTurn);
    }
        
    Crafty.c("Scroller", {
        init: function() {
            /* Create an Entity for every image.
             * The "repeat" is essential here as the Entity's width is 3x the canvas width (which equals
             * the width of the original image).
             */
            this._bgImage = Crafty.e("2D, DOM, Image").image(IMG_SKY, "repeat")
                                    .attr({x:0, y:0, w: WINDOW_WIDTH * 10, h: WINDOW_HEIGHT * 3, z: 0});
                                    
            /* Move the image entities to the left (by different offsets) on every 'EnterFrame'
             * Also, if we move them too far, adjust by adding one image width 
             */
            this.bind("EnterFrame", function() {
                this._bgImage.x -= 2;
                if (this._bgImage.x < -WINDOW_WIDTH) this._bgImage.x += WINDOW_WIDTH;
            });
        }
    });
    
    //the loading screen that will display while our assets load
    Crafty.scene("loading", function () {
        //load takes an array of assets and a callback when complete
        Crafty.load([IMG_SPRITE, IMG_SKY], function () {
            Crafty.scene("main"); //when everything is loaded, run the main scene
            Crafty.e("Scroller");
        });

        //black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
                .text("Loading")
                .css({ "text-align": "center" });
    });

    //automatically play the loading scene
    Crafty.scene("loading");
    
    Crafty.c('BombDropper', {
        _dropped: 0,
        maxBombs: 2,
        _key: Crafty.keys.SPACE,

        BombDropper: function() {
            var dropper = this;
            this.requires('Grid')

            //Create the bomb
            .bind('KeyDown', function(e) {
                if (e.key !== this._key) {
                    return;
                }
                
                if(this._dropped < this.maxBombs) {
                    Crafty.e('ExplodingProjectile')
                        .attr({z:100})
                        .col(this.col())
                        .row(this.row())
//                        .ExplodingProjectile()
                        .bind('explode', function() {
                            dropper._dropped--;
                        });

                    this._dropped++;
                }
            });
            
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
	//		            Crafty.viewport.mouselook(false);
			            
			            // TODO need to disable movement
		    		}
	            });
            
            return this;
        },
    });
    
    Crafty.c('ExplodingProjectile', {

        init: function() {
            this.requires("2D, DOM, SpriteAnimation, Grid, projectile, explodable")
                .animate('fly', 4, 0, 6)
                .animate('fly', 10, -1)
                .timeout(function() {
                    this.trigger("explode");
                }, 1000)
                .bind('explode', function() {
                    // create explosion
                    Crafty.e("ProjectileExplosion")
                    	.attr({ x: this.x, y: this.y, z: 8000 });
                    
                    // remove projectile
                    this.destroy();

            		// end current turn
                    endTurn();
                });
        },
//
//        BananaBomb: function() {
//            //Create shadow fire to help the AI
//            for(var i = this.col() - 2; i < this.col()+3; i++)
//                Crafty.e("ShadowBananaFire").attr({ z:8000 }).col(i).row(this.row());
//            for(var i = this.row() - 2; i < this.row()+3; i++)
//                Crafty.e("ShadowBananaFire").attr({ z:8000 }).col(this.col()).row(i);
//            return this;
//        }
    });
    
    Crafty.c('ProjectileExplosion', {
        init: function() {
        	var img = Crafty.e("2D, DOM, Image")
        					.image(IMG_EXPLOSION)
        					.attr({ x: -EXPLOSION_RADIUS, y: -EXPLOSION_RADIUS, z: 8000 });
        	
            this.requires("2D, DOM, Collision, fire, explosion")
				.attach(img)
    			.collision(new Crafty.circle(0, 0, EXPLOSION_RADIUS))
                .onHit('explodable', function(o) {
                    for(var i = 0; i < o.length; i++) {
                        o[i].obj.trigger("explode");
                    }
                })
                .timeout(function() {
                    this.destroy();
                }, 2000);
        },
    });
    
    // Helps the AI avoid unsafe tiles. Created when a bomb is dropped and removed after fire is gone
//    Crafty.c('ShadowBananaFire', {
//
//        init: function() {
//            this.requires("2D, Grid, empty, Collision, ShadowFire")
//                .collision()
//                .timeout(function() {
//                    this.destroy();
//                }, 6100);
//        }
//    });
    
    Crafty.c('Grid', {
        _cellSize: 16,
        Grid: function(cellSize) {
            if(cellSize) this._cellSize = cellSize;
            return this;
        },
        col: function(col) {
            if(arguments.length === 1) {
                this.x = this._cellSize * col;
                return this;
            } else {
                return Math.round(this.x / this._cellSize);
            }
        },
        row: function(row) {
            if(arguments.length === 1) {
                this.y = this._cellSize * row;
                return this;
            } else {
                return Math.round(this.y / this._cellSize);
            }
        },      
        snap: function(){
            this.x = Math.round(this.x/this._cellSize) * this._cellSize;
            this.y = Math.round(this.y/this._cellSize) * this._cellSize;
        }
    });
    
    Crafty.c('AIControls', {
        _move: 'down',
        _directions: {0: 'left', 1:'right', 2: 'up', 3: 'down'},
        _speed: 3,
        _inShadow: false,

        AIControls: function (speed) {
            if (speed) this._speed = speed;

            //functions to determine if there is a free path in some direction
            var AIScope = this;
            var pathTester = Crafty.e('2D, empty, Collision').attr({z:30000}).collision();
            var PathTest = {
                left: function() { pathTester.attr({x: AIScope.x-AIScope._speed, y: AIScope.y});
                    return !(pathTester.hit('solid') || (!AIScope._inShadow && pathTester.hit('ShadowBananaFire')));},
                right: function() { pathTester.attr({x: AIScope.x+AIScope._speed, y: AIScope.y});
                    return !(pathTester.hit('solid') || (!AIScope._inShadow && pathTester.hit('ShadowBananaFire')));},
                up: function() { pathTester.attr({x: AIScope.x, y: AIScope.y-AIScope._speed});
                    return !(pathTester.hit('solid') || (!AIScope._inShadow && pathTester.hit('ShadowBananaFire')));},
                down: function() { pathTester.attr({x: AIScope.x, y: AIScope.y+AIScope._speed});
                    return !(pathTester.hit('solid') || (!AIScope._inShadow && pathTester.hit('ShadowBananaFire')));},
                none: function() { return false; }
            };

            function bombWillHit() {
                pathTester.attr({x: AIScope.x-1, y: AIScope.y});
                if(pathTester.hit('flower')) { return true; }
                pathTester.attr({x: AIScope.x+1, y: AIScope.y});
                if(pathTester.hit('flower')) { return true; }
                pathTester.attr({x: AIScope.x, y: AIScope.y-1});
                if(pathTester.hit('flower')) { return true; }
                pathTester.attr({x: AIScope.x, y: AIScope.y+1});
                if(pathTester.hit('flower')) { return true; }
                return false;
            }

            this.bind('enterframe', function() {
                var nextDirection = '';
                if(PathTest[this._move]())
                {
                    nextDirection = this._move;

                    //when we are at a crossroad interesting things can happen
                    if(this.x % 16 < this._speed && this.y % 16 < this._speed) {
                        //change direction
                        if(Crafty.math.randomInt(0, 2) === 0) {
                            if(nextDirection === 'down' || nextDirection === 'up') {
                                if(PathTest.left()) { nextDirection = 'left'; }
                                else if(PathTest.right()) { nextDirection = 'right'; }
                            }else{
                                if(PathTest.up()) { nextDirection = 'up'; }
                                else if(PathTest.down()) { nextDirection = 'down'; }
                            }
                        }
                        if(bombWillHit() &&
                                !this._inShadow) {
                            this.trigger('Dropped');
                        }
                    }
                }else{
                    this.snap();
                    nextDirection = this._directions[Crafty.math.randomInt(0,3)];
                    if(nextDirection === this._move) {
                        nextDirection = "none"; //we need to think
                    }

                }
                this._move = nextDirection;

                if(PathTest[this._move]()) {
                    if (this._move == "right") this.x += this._speed;
                    else if (this._move == "left") this.x -= this._speed;
                    else if (this._move == "up") this.y -= this._speed;
                    else if (this._move == "down") this.y += this._speed;
                }
            })
            .onHit("ShadowBananaFire", function () {
                this._inShadow = true;
            }, function() {
                this._inShadow = false;
            });

            return this;
        }
    });
    
    Crafty.c('Character', {
    	isFiring: false,
    	powerAmount: 0,
    	faceDirection: 0,
    	playerNum: 0,
    	
    	Character: function(num) {
    			this.playerNum = num;
    			
                //setup animations
                this.requires("SpriteAnimation, Collision, solid")
	                .animate("walk_left", 6, 3, 8)
	                .animate("walk_right", 9, 3, 11)
	                .animate("walk_up", 3, 3, 5)
	                .animate("walk_down", 0, 3, 2)
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
                // A rudimentary way to prevent the user from passing solid areas
                .bind('Moved', function(from) {
                    if(this.hit('solid')){
                        this.attr({x: from.x, y:from.y});
                    }
                })
                .onHit("fire", function() {
                    this.destroy();
                })
                .bind("StartTurn", function (turnNum) {
                    if (this.playerNum === turnNum) {
                    	this.addComponent("BombDropper")
                    		.addComponent("RangedAttacker")
                    		.addComponent("Twoway")
                    		.BombDropper()
                    		.RangedAttacker()
                    		.twoway(4, 3);
                    }
                })
                .bind("EndTurn", function (turnNum) {
                    if (this.playerNum === turnNum) {
        	    		this.removeComponent("BombDropper")
        	    			.removeComponent("RangedAttacker")
        	    			.removeComponent("Twoway")
        	    			.unbind('MouseDown')
        	    			.unbind('KeyDown');
                    }
                });
            	
            return this;
        },
    });
    
    Crafty.c("Circle", {
        Circle: function(radius, color) {
            this.radius = radius;
            this.w = this.h = radius * 2;
            this.color = color || "#000000";
            
            return this;
        },
        
        draw: function() {
           var ctx = Crafty.canvas.context;
           ctx.save();
           ctx.strokeStyle = this.color;
           ctx.beginPath();
           ctx.arc(
               this.x,
               this.y,
               this.radius,
               0,
               Math.PI * 2               
           );
           ctx.closePath();
           ctx.stroke();
        }
    });
    
    Crafty.c("SolidCircle", {
    	SolidCircle: function(radius, color) {
            this.radius = radius;
            this.w = this.h = radius * 2;
            this.color = color || "#000000";
            
            return this;
        },
        
        draw: function() {
           var ctx = Crafty.canvas.context;
           ctx.save();
           ctx.fillStyle = this.color;
           ctx.beginPath();
           ctx.arc(
               this.x,
               this.y,
               this.radius,
               0,
               Math.PI * 2               
           );
           ctx.closePath();
           ctx.fill();
        }
    });
    
    Crafty.c("SolidPolygon", {
    	SolidPolygon: function(points, color, angle, origin) {
            this.points = points;
            this.color = color || "#000000";
            this.angle = angle || 0;
            this.origin = origin || [0, 0];
            
            return this;
        },
        
        draw: function() {
            var ctx = Crafty.canvas.context;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for(var i in this.points){
            	var p = this.points[i];
            	var o = this.origin;
            	var rotatedPoint = [(p[0] - o[0]) * Math.cos(this.angle) - (p[1] - o[1]) * Math.sin(this.angle) + o[0], (p[0] - o[0]) * Math.sin(this.angle) + (p[1] - o[1]) * Math.cos(this.angle) + o[1]];
            	
                ctx.lineTo(Crafty.viewport.x + rotatedPoint[0], Crafty.viewport.y + rotatedPoint[1]);
            }
            ctx.closePath();
            ctx.fill();
        }
    });
    
    Crafty.c("Slingshot", {
        init: function() {
            this.requires('2D, Canvas, Circle');
        },
        
        Slingshot: function(x, y, radius, color) {        	
        	this.Circle(radius, color)
        		.attr({ x: x, y: y });
            return this;
        }
    });
    
    Crafty.c("SlingshotAnchor", {
        init: function() {
            this.requires('2D, Canvas, SolidCircle');
        },
        
        SlingshotAnchor: function(x, y, color) {
        	var anchorRadius = 2;
        	this.SolidCircle(anchorRadius, color)
        		.attr({ x: x, y: y });
            return this;
        }
    });

    Crafty.c("SlingshotArrow", {
        init: function() {
            this.requires('2D, Canvas, SolidPolygon');
        },
        
        // construct an equilateral triangle
        SlingshotArrow: function(centerX, centerY, x, y, color) {
        	var arrowSize = 20;
    		var slope = y / x;
    		var angle = Math.atan(slope);
    		var point1 = [x, y - arrowSize * Math.sqrt(3) / 4];
    		var point2 = [x - arrowSize / 2, y + arrowSize * Math.sqrt(3) / 4];
    		var point3 = [x + arrowSize / 2, y + arrowSize * Math.sqrt(3) / 4];
        	this.SolidPolygon([point1, point2, point3], color, angle, [x, y])
        		.attr({ x: x, y: y });
            return this;
        }
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
        
        generateWorld();
        addObstacles();
    	
        //create our player entity with some premade components
        var player1 = Crafty.e("2D, DOM, Character, player, Twoway, BombDropper, RangedAttacker, Gravity")
                .attr({ x: 80, y: WINDOW_HEIGHT - GROUND_HEIGHT - 32, z: 1 })
                .gravity("ground")
                .twoway(4, 3)
                .Character(1)
                .BombDropper()
                .RangedAttacker();
        
        var player2 = Crafty.e("2D, DOM, Character, player, Gravity")
		        .attr({ x: 912, y: 176, z: 1 })
		        .gravity("ground")
		        .Character(2);
		
        Crafty.bind("UpdatePower", function(player) {
        	info.powerAmount.text(player.powerAmount);
        });
        
        Crafty.bind("UpdateTurn", function() {
        	info.turn.text(currentTurn);
        });    	

        Crafty.bind("Firing", function(player) {
        	// bind new mouse events
            $(this).mousemove(function(event) {
            	Crafty.trigger("CheckFiring", [event, player]);
            });
            $(this).mouseup(function(event) {
            	Crafty.trigger("FireProjectile", [event, player]);
            });
        });
    
        Crafty.bind("FireProjectile", function(args) {
        	var event = args[0];
        	var player = args[1];
        	
        	if(player.isFiring && player.powerAmount > 0) {
        		// calculate the angle that the mouse was released, and use that to calculate the target trajectory
        		// tan a = y / x
        		// x = p cos a
        		// y = p cos a
        		var angle = Math.atan(Math.abs(event.clientY - player.y) / Math.abs(event.clientX - player.x));
        		var targetPoint = {
        				x: 100 * player.powerAmount * Math.cos(angle) * (player.faceDirection == DIRECTION.LEFT ? -1 : 1),
        				y: 100 * player.powerAmount * Math.sin(angle),
        		};
        		
        		player.isFiring = false;
                var projectile = Crafty.e("2D, DOM, ExplodingProjectile, Gravity, Tween")
    						            .attr({ x: player.x, y: player.y, z: player.z, xspeed: 10 })
    					                .gravity("ground")
    					                .tween({ x: player.x + targetPoint.x, y: player.y - targetPoint.y }, (6 - player.powerAmount) * 24);
        		player.powerAmount = 0;
        		Crafty.trigger("UpdatePower", player);
        		
        		// unbind mouse events and re-enable mouselook
                $(this).unbind('mouseup');
                $(this).unbind('mousemove');
//            	Crafty.viewport.mouselook(true);
            	
            	// remove slingshot
        		Crafty("Slingshot").destroy();
        	}
        });
        
        Crafty.bind("CheckFiring", function(args) {
        	var event = args[0];
        	var player = args[1];
        	
        	if(player.isFiring) {
        		// calculate distance between mouse cursor and player
        		// x^2 + y^2 = z^2
        		// the pixel distance is translated to "power" in increments of 20
        		var distance = Math.sqrt(Math.pow(event.clientX - player.x, 2) + Math.pow(event.clientY - player.y, 2));
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
        		Crafty("Slingshot").destroy();
        		Crafty.e("Slingshot")
    	    		.Slingshot(player.x, player.y, distance, intensity)
    	    		.attach(Crafty.e("SlingshotAnchor")
    	    					.SlingshotAnchor(event.clientX, event.clientY, intensity))
    	    		.attach(Crafty.e("SlingshotArrow")
	    					.SlingshotArrow(player.x, player.y, 2 * player.x - event.clientX, 2 * player.y - event.clientY, distance, intensity));
            	
        		Crafty.trigger("UpdatePower", player);

        		// if the mouse is behind the character, swivel
        		if(event.clientX > player.x) {
        			Crafty.trigger("FaceNewDirection", -1);
        		}
        		else {
        			Crafty.trigger("FaceNewDirection", 1);
        		}
        	}
        });

		Crafty.trigger("UpdateTurn");
    });
    
//    Crafty.viewport.mouselook(true);
    
//    $(this).mousewheel(function(event, delta) {
//    	Crafty.viewport.zoom(delta, 0, 0, 5);
//    });
});