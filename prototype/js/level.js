var IMG_LEVEL1 = "img/level1.png";
var GROUND_HEIGHT = 100;

Crafty.c("Ground", {
	deletedPixels: [],
	
    init: function() {
        this.requires('2D, Canvas, Image, Mask')
			.attr({x: 0, y: GROUND_HEIGHT, z: 1})
			.image(IMG_LEVEL1);
        
		this.bind("Draw", function() {
	        var ctx = Crafty.canvas.context;
	        for(var i = 0; i < this.deletedPixels.length; i++) {
	        	var point1 = this.deletedPixels[i].point1;
	        	var point2 = this.deletedPixels[i].point2;
	    	    var imageData = ctx.getImageData(point1.x + Crafty.viewport.x, point1.y + Crafty.viewport.y, point2.x - point1.x, point2.y - point1.y);
	    	    
	    	    for (var x = 0; x < imageData.width; x++) {
	    	    	for (var y = 0; y < imageData.height; y++) {
	    	    		var offset = (y * imageData.width + x) * 4;
	    	    		imageData.data[offset + 3] = 0;	// set alpha to 0
	    	    	}
	    	    }
	    	    ctx.putImageData(imageData, point1.x + Crafty.viewport.x, point1.y + Crafty.viewport.y);
	        }			
		});
    },

    // TODO pass in a circle shape
	SetDeletedPixels: function(point1, point2) {
		this.deletedPixels.push({point1: point1, point2: point2});
	},
});

function generateWorld() {
	Crafty.e("Ground");
	
	// TODO here: create masking image with the same dimensions
	
    //loop through all tiles
//    for (var tileX = 0; tileX < WINDOW_WIDTH / 16; tileX++) {
//        for (var tileY = 0; tileY < WINDOW_HEIGHT / 16; tileY++) {
//        	
//            // place grass on all tiles
//    		createBaseTile(tileX * 16, WINDOW_HEIGHT - GROUND_HEIGHT + tileY * 16, 1);
//            
//            // flowers and bushes on the top ground layer minus obstacles
//        	// TODO remove hardcoding
//            if(tileY === 0 && (tileX > 15) && (tileX < 31 || tileX > 40) && (tileX < 54 || tileX > 63)) {
//            	createSurfaceTile(tileX * 16, WINDOW_HEIGHT - GROUND_HEIGHT + tileY * 16, 2);
//            }
//        }
//    }
//    
    Crafty.e("2D, DOM, Box2D, water")
        .attr({ x: 0, y: 0})
        .box2d({
            bodyType: 'static',
            shape: [[0, WINDOW_HEIGHT],
                    [WINDOW_WIDTH, WINDOW_HEIGHT]]
        });
        
//	    var floor = Crafty.e("2D, DOM, Box2D, ground, explodable")
//	        .attr({ x: 0, y: 0})
//	        .box2d({
//	            bodyType: 'static',
//	            shape: [[0, WINDOW_HEIGHT - GROUND_HEIGHT],
//	                    [WINDOW_WIDTH, WINDOW_HEIGHT - GROUND_HEIGHT]]
//	        })
//	        .bind('HitByExplosion', function() {
//            	console.log("Exploding " + this[0]);
//            	Crafty.box2D.world.DestroyBody(this.body);
//	            this.destroy();
//	        });
}
    
function createBaseTile(x, y, z) {
	return Crafty.e("2D, DOM, explodable, ground, grass" + Crafty.math.randomInt(1, 4))
	                .attr({ x: x, y: y, z: z, })
	                .bind('HitByExplosion', function(attacker) {
	                	console.log("Exploding " + this[0]);
	                    destroyedBodies.push(this);
	                });
}

function createSurfaceTile(x, y, z) {
	if(Crafty.math.randomInt(1, 50) > 30) {
    	return Crafty.e("2D, DOM, Box2D, explodable, ground, flower, SpriteAnimation")
			        .attr({ x: x, y: y, z: z, })
		    		.animate('wind', 0, 1, 3)
					.animate('wind', 80, -1)
			        .bind('HitByExplosion', function(attacker) {
	                	console.log("Exploding " + this[0]);
	                    destroyedBodies.push(this);
			        })
				    .box2d({
				        bodyType: 'static',
				    });
	}
	else {
    	return Crafty.e("2D, DOM, Box2D, explodable, ground, bush, SpriteAnimation")
			        .attr({ x: x, y: y, z: z, })
					.animate('wind', 0, 2, 1)
					.animate('wind', 80, -1)
			        .bind('HitByExplosion', function(attacker) {
	                	console.log("Exploding " + this[0]);
	                    destroyedBodies.push(this);
			        })
				    .box2d({
				        bodyType: 'static',
				    });
	}
}

function addObstacles() {    
	// bump1
//    Crafty.e("2D, DOM, Box2D, explodable, ground, bush")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[0, 288],
//	                [256, 288]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//            this.destroy();
//        }); 
	createBaseTile(0, 288, 1);
	createBaseTile(16, 288, 1);
	createBaseTile(32, 288, 1);
	createBaseTile(48, 288, 1);
	createBaseTile(64, 288, 1);
	createBaseTile(80, 288, 1);
	createBaseTile(96, 288, 1);
	createBaseTile(112, 288, 1);
	createBaseTile(128, 288, 1);
	createBaseTile(144, 288, 1);
	createBaseTile(160, 288, 1);
	createBaseTile(176, 288, 1);
	createBaseTile(192, 288, 1);
	createBaseTile(208, 288, 1);
	createBaseTile(224, 288, 1);
	createBaseTile(240, 288, 1);
	createSurfaceTile(0, 288, 2);
	createSurfaceTile(16, 288, 2);
	createSurfaceTile(32, 288, 2);
	createSurfaceTile(48, 288, 2);
	createSurfaceTile(64, 288, 2);
	createSurfaceTile(80, 288, 2);
	createSurfaceTile(96, 288, 2);
	createSurfaceTile(112, 288, 2);
	createSurfaceTile(224, 288, 2);
	createSurfaceTile(240, 288, 2);

//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[128, 272],
//	                [224, 272]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//            this.destroy();
//        });
	createBaseTile(128, 272, 1);
	createBaseTile(144, 272, 1);
	createBaseTile(160, 272, 1);
	createBaseTile(176, 272, 1);
	createBaseTile(192, 272, 1);
	createBaseTile(208, 272, 1);
	createSurfaceTile(128, 272, 2);
	createSurfaceTile(144, 272, 2);
	createSurfaceTile(192, 272, 2);
	createSurfaceTile(208, 272, 2);
	
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[160, 256],
//	                [192, 256]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//            this.destroy();
//        });
	createBaseTile(160, 256, 1);
	createBaseTile(176, 256, 1);
	createSurfaceTile(160, 256, 2);
	createSurfaceTile(176, 256, 2);

	// bump2
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[496, 288],
//	                [656, 288]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//            this.destroy();
//        });
	createBaseTile(496, 288, 1);
	createBaseTile(512, 288, 1);
	createBaseTile(528, 288, 1);
	createBaseTile(544, 288, 1);
	createBaseTile(560, 288, 1);
	createBaseTile(576, 288, 1);
	createBaseTile(592, 288, 1);
	createBaseTile(608, 288, 1);
	createBaseTile(624, 288, 1);
	createBaseTile(640, 288, 1);
	createSurfaceTile(496, 288, 2);
	createSurfaceTile(512, 288, 2);
	createSurfaceTile(528, 288, 2);
	createSurfaceTile(544, 288, 2);
	createSurfaceTile(560, 288, 2);
	createSurfaceTile(640, 288, 2);

//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[576, 272],
//	                [640, 272]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//            this.destroy();
//        });
	createBaseTile(576, 272, 1);
	createBaseTile(592, 272, 1);
	createBaseTile(608, 272, 1);
	createBaseTile(624, 272, 1);
	createSurfaceTile(576, 272, 2);
	createSurfaceTile(592, 272, 2);
	createSurfaceTile(608, 272, 2);
	createSurfaceTile(624, 272, 2);	
	
	// mountain
    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[800, 96],
	                [832, 96]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(800, 96, 1);
	createBaseTile(816, 96, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[768, 112],
	                [848, 112]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(768, 112, 1);
	createBaseTile(784, 112, 1);
	createBaseTile(800, 112, 1);
	createBaseTile(816, 112, 1);
	createBaseTile(832, 112, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[752, 128],
	                [864, 128]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(752, 128, 1);
	createBaseTile(768, 128, 1);
	createBaseTile(784, 128, 1);
	createBaseTile(800, 128, 1);
	createBaseTile(816, 128, 1);
	createBaseTile(832, 128, 1);
	createBaseTile(848, 128, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[816, 144],
	                [880, 144]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(816, 144, 1);
	createBaseTile(832, 144, 1);
	createBaseTile(848, 144, 1);
	createBaseTile(864, 144, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[800, 160],
	                [896, 160]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(800, 160, 1);
	createBaseTile(816, 160, 1);
	createBaseTile(832, 160, 1);
	createBaseTile(848, 160, 1);
	createBaseTile(864, 160, 1);
	createBaseTile(880, 160, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[816, 176],
	                [912, 176]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(816, 176, 1);
	createBaseTile(832, 176, 1);
	createBaseTile(848, 176, 1);
	createBaseTile(864, 176, 1);
	createBaseTile(880, 176, 1);
	createBaseTile(896, 176, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[816, 192],
	                [928, 192]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(816, 192, 1);
	createBaseTile(832, 192, 1);
	createBaseTile(848, 192, 1);
	createBaseTile(864, 192, 1);
	createBaseTile(880, 192, 1);
	createBaseTile(896, 192, 1);
	createBaseTile(912, 192, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[832, 208],
	                [944, 208]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(832, 208, 1);
	createBaseTile(848, 208, 1);
	createBaseTile(864, 208, 1);
	createBaseTile(880, 208, 1);
	createBaseTile(896, 208, 1);
	createBaseTile(912, 208, 1);
	createBaseTile(928, 208, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[832, 224],
	                [960, 224]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(832, 224, 1);
	createBaseTile(848, 224, 1);
	createBaseTile(864, 224, 1);
	createBaseTile(880, 224, 1);
	createBaseTile(896, 224, 1);
	createBaseTile(912, 224, 1);
	createBaseTile(928, 224, 1);
	createBaseTile(944, 224, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[848, 240],
	                [976, 240]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(848, 240, 1);
	createBaseTile(864, 240, 1);
	createBaseTile(880, 240, 1);
	createBaseTile(896, 240, 1);
	createBaseTile(912, 240, 1);
	createBaseTile(928, 240, 1);
	createBaseTile(944, 240, 1);
	createBaseTile(960, 240, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[848, 256],
	                [992, 256]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(848, 256, 1);
	createBaseTile(864, 256, 1);
	createBaseTile(880, 256, 1);
	createBaseTile(896, 256, 1);
	createBaseTile(912, 256, 1);
	createBaseTile(928, 256, 1);
	createBaseTile(944, 256, 1);
	createBaseTile(960, 256, 1);
	createBaseTile(976, 256, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[864, 272],
	                [1008, 272]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(864, 272, 1);
	createBaseTile(880, 272, 1);
	createBaseTile(896, 272, 1);
	createBaseTile(912, 272, 1);
	createBaseTile(928, 272, 1);
	createBaseTile(944, 272, 1);
	createBaseTile(960, 272, 1);
	createBaseTile(976, 272, 1);
	createBaseTile(992, 272, 1);

    Crafty.e("2D, DOM, Box2D, explodable, ground")
		.attr({x: 0, y: 0})
	    .box2d({
	        bodyType: 'static',
	        shape: [[864, 288],
	                [1024, 288]]
	    })
        .bind('HitByExplosion', function(attacker) {
        	console.log("Exploding " + this[0]);
            destroyedBodies.push(this);
        });
	createBaseTile(864, 288, 1);
	createBaseTile(880, 288, 1);
	createBaseTile(896, 288, 1);
	createBaseTile(912, 288, 1);
	createBaseTile(928, 288, 1);
	createBaseTile(944, 288, 1);
	createBaseTile(960, 288, 1);
	createBaseTile(976, 288, 1);
	createBaseTile(992, 288, 1);
	createBaseTile(1008, 288, 1);
}
