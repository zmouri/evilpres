var EXPLOSION_RADIUS = 70;

Crafty.c('LineOfSightAttack', {
	attacker: null,
	
	LineOfSightAttack: function(graphic, attacker) {
    	this.attacker = attacker;
    	Crafty.audio.play("lineofsight1", -1);
    	
        this.requires("2D, DOM, Box2D, SpriteAnimation, explodable, " + graphic)
            .animate('fly', 4, 1, 6)
            .animate('fly', 10, -1)
//                .collision()
            .box2d({
            	bodyType: 'dynamic',
            	density: 30,
            	restitution: 0.1,
            })
//                .onHit('ground', function(o) {
//                	console.log('hit ground');
//                    this.trigger("Explode");
//                })
//                .onHit('player', function(o) {
//                	console.log('hit player');
//                    this.trigger("Explode");
//                })
//   			 	.onContact("ground", function(data){
//		 			console.log("contact ground");
//		 			this.trigger("Explode");
//   			 	})
//   			 	.onContact("player", function(data){
//		 			console.log("contact player");
//		 			this.trigger("Explode");
//   			 	})
            .timeout(function() {	// TODO change this from timeout to if it goes too far away
                this.trigger("Explode");
            }, 5000)
            .bind("Explode", function() {
            	Crafty.audio.stop("lineofsight1");
            	
                // create explosion
            	var explosion = Crafty.e("2D, ProjectileExplosion")
        							.attr({x: this.x, y: this.y, z: 4})
        							.SetAttacker(this.attacker);
            	queuedBodies.push(explosion);
                
                // remove projectile
                destroyedBodies.push(this);
            })
            .bind("Move", function(position) {
            	// follow if it goes off the stage
            	if(position._x < Crafty.viewport.x || position._x > Crafty.viewport.x 
            			|| position._y < Crafty.viewport.y || position._y > Crafty.viewport.y) {
                	console.log("moved off stage: " + position._x + ", " + position._y);
//            		Crafty.viewport.follow(this, 0, 0);	// TODO: jerky, needs to be smoother
            	}
            })
            .bind("Remove", function() {
            	Crafty.audio.stop("lineofsight1");
            });
//                .bind("EnterFrame", function() {
//                	this.body.ApplyForce({x: 0, y: this.body.GetMass() * -1 * GRAVITY}, this.body.GetWorldCenter());	// cancel gravity
//                });
		
        this.body.SetGravityScale(0);
		return this;
    },
    
    Attack: function(power, angle) {
//            this.body.SetBullet(true);
        return this.body.ApplyImpulse(new b2Vec2(power * Math.cos(angle), power * Math.sin(angle)), this.body.GetWorldCenter());
    }
});

Crafty.c('ExplodingProjectile', {
	attacker: null,
	
    ExplodingProjectile: function(graphic, attacker) {
    	this.attacker = attacker;
    	Crafty.audio.play("projectile1", -1);
    	
        this.requires("2D, DOM, Box2D, SpriteAnimation, explodable, " + graphic)
            .animate('fly', 4, 0, 6)
            .animate('fly', 10, -1)
            .box2d({
            	bodyType: 'dynamic',
            	density: 50,
            	restitution: 0.8,
            })
            .timeout(function() {
                this.trigger("Explode");
            }, 1000)
            .bind("Explode", function() {
            	Crafty.audio.stop("projectile1");
            	
                // create explosion
            	var explosion = Crafty.e("2D, ProjectileExplosion")
        							.attr({x: this.x, y: this.y, z: 4})
        							.SetAttacker(this.attacker);
            	queuedBodies.push(explosion);
                
                // remove projectile
                destroyedBodies.push(this);
            })
            .bind("Move", function(position) {
            	// follow if it goes off the stage
            	if(position._x < Crafty.viewport.x || position._x > Crafty.viewport.x 
            			|| position._y < Crafty.viewport.y || position._y > Crafty.viewport.y) {
                	console.log("moved off stage: " + position._x + ", " + position._y);
//            		Crafty.viewport.follow(this, 0, 0);	// TODO: jerky, needs to be smoother
            	}
            })
            .bind("Remove", function() {
            	Crafty.audio.stop("projectile1");
            });
        
        return this;
    },
    
    Throw: function(power, angle) {
        return this.body.ApplyImpulse(new b2Vec2(power * Math.cos(angle), power * Math.sin(angle)), this.body.GetWorldCenter());
    }
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
	attacker: null,
	radius: 0,
	
	SetAttacker: function(attacker) {
		this.attacker = attacker;
		return this;
	},
	
    Explode: function(graphic) {
    	Crafty.audio.play("explosion1", -1);
    	this.radius = EXPLOSION_RADIUS;
    	
    	// TODO uses collision because we still have some non-box2d elements that need to be removed
    	// box2d won't collide with non-box2d elements
    	// also this needs to be dynamic, because two static objects also cannot collide
        this.requires("2D, Canvas, SolidCircle")
//            .box2d({
//            	density: 1,
//        		bodyType: 'dynamic',
//            })
    		.SolidCircle(this.radius, "#000000")
//			.collision()
////                .onContact('explodable', function(o) {
////                	console.log('contact explodable');
////                    for(var i = 0; i < o.length; i++) {
////                        o[i].obj.trigger("HitByExplosion");
////                    }
////                })
//            .onHit('explodable', function(o) {
//            	console.log('hit explodable');
//                for(var i = 0; i < o.length; i++) {
//                    o[i].obj.trigger("HitByExplosion");
//                }
//                
//                // TODO use circle
//                Crafty("Ground").SetDeletedPixels({x: this.x - 50, y: this.y - 50}, {x: this.x + 50, y: this.y + 50});
//            })
//                .onHit('player', function(o) {
//                	console.log('hit player');
//                    for(var i = 0; i < o.length; i++) {
//                        o[i].obj.trigger("TakeDamage", [this.attacker, "explosion"]);
//                    }
//                })
//   			 	.onContact("player", function(o){
//		 			console.log("hit player");
//                    for(var i = 0; i < o.length; i++) {
//                        o[i].obj.trigger("TakeDamage", [this.attacker, "explosion"]);
//                    }
//   			 	})
            .timeout(function() {
            	Crafty.audio.stop("explosion1");
                destroyedBodies.push(this);

            	Crafty.trigger("UpdateTurn");
            	getCurrentPlayer().trigger("StartTurn");
            }, 2000)
            .bind("Remove", function() {
            	Crafty.audio.stop("explosion1");
            });
//            .bind("EnterFrame", function() {
//            	this.body.ApplyForce({x: 0, y: this.body.GetMass() * -1 * GRAVITY}, this.body.GetWorldCenter());	// cancel gravity
//            });

	    	// using the selector does not work, it returns a shallow copy of the entity without the collision map
        	// why??
	    	// we can get the actual entity itself by searching the map
	//    	var ground = Crafty("Ground");
			var entities = Crafty.map.search({ _x: this.x - this.radius, _y: this.y - this.radius, _w: 2 * this.radius, _h: 2 * this.radius });
			
			for(var i = 0; i < entities.length; i++) {
				obj = entities[i];
				if(obj.__c["Ground"]) {
	            	obj.trigger("ExplodePixels", {entity: this});
				}
				if(obj.__c["Character"]) {
					console.log("hit player");
	            	obj.trigger("HitByExplosion", this.attacker);
				}
			}
//        this.body.SetGravityScale(0);
//        this.body.SetUserData(this);	// TODO is this needed?
//        this.body.SetFixedRotation(true);
//        
        	// add circle sensor
//	        var circle = new b2CircleShape();
//	        circle.SetRadius(EXPLOSION_RADIUS/PIXEL2METER_RATIO);
//	        
//	        var fixture = new b2FixtureDef();
//	        fixture.shape = circle;
//	        fixture.isSensor = true;
////            fixture.filter.categoryBits = RADAR_SENSOR;
////            fixture.filter.maskBits = ENEMY_AIRCRAFT;//radar only collides with aircraft
//            this.body.CreateFixture(fixture);
            return this;
        },
    });
 
    