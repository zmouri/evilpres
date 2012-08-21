$(document).ready(function () {
	var IMG_SPRITE = "img/sprite_bman.png";
	var IMG_SKY = "img/Sky_back_layer.png";
	var IMG_EXPLOSION = "img/explosion.png";
	
	var GROUND_HEIGHT = 200;
	var EXPLOSION_RADIUS = 70;
	
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
        bush1: [0, 2],
        bush2: [1, 2],
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
                var grass = Crafty.e("2D, DOM, grass" + Crafty.math.randomInt(1, 4) + ", Collision, solid, explodable, ground")
			                    .attr({ x: tileX * 16, y: GROUND_HEIGHT + tileY * 16, z: 1, })
			                    .bind('explode', function() {
			                        this.destroy();
			                    })
			                    .collision();
                
                if(grass.hit('explosion')) {
                	grass.destroy();
                }
                
                // flowers and bushes on the top ground layer
                if(tileY === 0) {                    
                	var isFlower = Crafty.math.randomInt(1, 50);
                	if(isFlower > 30) {
                        var flowers = Crafty.e("2D, DOM, flower, Collision, solid, SpriteAnimation, explodable, ground")
					                        .attr({ x: tileX * 16, y: GROUND_HEIGHT + tileY * 16, z: 1000, })
					                        .animate('wind', 0, 1, 3)
					                        .animate('wind', 80, -1)
					                        .bind('explode', function() {
					                            this.destroy();
					                        })
					                        .collision();
                        
		                if(flowers.hit('explosion')) {
		                	flowers.destroy();
		                }
                	}
                	else {
	                    var bushes = Crafty.e("2D, DOM, solid, bush1, Collision, SpriteAnimation, explodable, ground")
				                    	.attr({ x: tileX * 16, y: GROUND_HEIGHT + tileY * 16, z: 2000, })
				                        .animate('wind', 0, 2, 1)
				                        .animate('wind', 80, -1)
				                        .bind('explode', function() {
				                            this.destroy();
				                        })
				                        .collision();
	                    
		                if(bushes.hit('explosion')) {
		                    bushes.destroy();
		                }
                	}
                }
            }
        }
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

        init: function() {
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
        },
        bombDropper: function(key) {
            this._key = key;
            return this;
        }
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
                    this.destroy();

                    // create explosion
                    Crafty.e("ProjectileExplosion")
                    	.attr({ x: this.x, y: this.y, z: 8000 });
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
    
    Crafty.c('Ape', {
    	isFiring: false,
    	powerAmount: 0,
    	
        Ape: function() {
                //setup animations
                this.requires("SpriteAnimation, Collision, Mouse")
	                .animate("walk_left", 6, 3, 8)
	                .animate("walk_right", 9, 3, 11)
	                .animate("walk_up", 3, 3, 5)
	                .animate("walk_down", 0, 3, 2)
                //change direction when a direction change event is received
                .bind("NewDirection",
                    function (direction) {
                        if (direction.x < 0) {
                            if (!this.isPlaying("walk_left"))
                                this.stop().animate("walk_left", 10, -1);
                        }
                        if (direction.x > 0) {
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
                // A rudimentary way to prevent the user from passing solid areas
                .bind('Moved', function(from) {
                    if(this.hit('solid')){
                        this.attr({x: from.x, y:from.y});
                    }
                })
                .onHit("fire", function() {
                    this.destroy();
                })
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
        }
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
           ctx.fillStyle = this.color;
           ctx.beginPath();
           ctx.arc(
               this.x + this.radius,
               this.y + this.radius,
               this.radius,
               0,
               Math.PI * 2
           );
           ctx.closePath();
           ctx.fill();
        }
    });
    
    Crafty.c("Slingshot", {
        Slingshot: function(x, y) {
            Crafty.e("2D, Canvas, Circle")
            	.attr({ x: x, y: y })
                .Circle(40, "#FF0000");
        }
    });
    
    Crafty.c("PlayerControls", {
        init: function() {
            this.requires('Twoway');
        },
        
        playerControls: function(speed, jumpSpeed) {
            this.twoway(speed, jumpSpeed);
            return this;
        }
        
    });
    
    Crafty.scene("main", function () {
        var bars = {
            power: $('#power')
        };
        bars.power.addClass('green');
        
        var info = {
            powerAmount: bars.power.find('.text')
        };
        
        generateWorld();
    	
        //create our player entity with some premade components
        var player1 = Crafty.e("2D, DOM, Ape, player, PlayerControls, BombDropper, Gravity")
                .attr({ x: 200, y: GROUND_HEIGHT - 16, z: 1 })
                .playerControls(4, 3)
                .gravity("ground")
                .Ape();
        
        Crafty.bind("UpdatePower", function() {
        	info.powerAmount.text(player1.powerAmount);
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
        				x: 100 * player.powerAmount * Math.cos(angle),
        				y: 100 * player.powerAmount * Math.sin(angle),
        		};
        		player.isFiring = false;
                var projectile = Crafty.e("2D, DOM, ExplodingProjectile, Gravity, Tween")
    						            .attr({ x: player.x, y: player.y, z: player.z, xspeed: 10 })
    					                .gravity("ground")
    					                .tween({ x: player.x + targetPoint.x, y: player.y - targetPoint.y }, (6 - player.powerAmount) * 24);
        		player.powerAmount = 0;
        		Crafty.trigger("UpdatePower");
        		
        		// unbind mouse events and re-enable mouselook
                $(this).unbind('mouseup');
                $(this).unbind('mousemove');
            	Crafty.viewport.mouselook(true);
            	
            	// remove slingshot
            	// TODO not working
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
        		
        		// draw the slingshot
        		Crafty.e("Slingshot")
        	    	.Slingshot(player.x, player.y);
        		
        		Crafty.trigger("UpdatePower");
        	}
        });
    });
    
    Crafty.viewport.mouselook(true);
    
    $(this).mousewheel(function(event, delta) {
    	Crafty.viewport.zoom(delta, 0, 0, 5);
    });
});