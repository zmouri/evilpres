var IMG_LEVEL1 = "img/level1.png";
var GROUND_HEIGHT = 100;

Crafty.c("Ground", {
	deletedPixels: [],
	isDirty: true,
	collisionMap: [],
	isDebug: false,
	
    init: function() {
    	this.isDirty = true;
    	this.isDebug = false;
    	
        this.requires('2D, Canvas, Image, Box2D')
			.attr({x: 0, y: GROUND_HEIGHT, z: 1})
			.image(IMG_LEVEL1)
			.box2d({bodyType: "static"});
        
		this.bind("Draw", function() {
//			var canvas = $('canvas');
			var canvasWidth  = WINDOW_WIDTH;
			var canvasHeight = WINDOW_HEIGHT;
	        var ctx = Crafty.canvas.context;
	        
	        // remove deleted pixels
	        // TODO combine this with the loop below to optimize
	        for(var i = 0; i < this.deletedPixels.length; i++) {
	        	var point1 = this.deletedPixels[i].point1;
	        	var point2 = this.deletedPixels[i].point2;
	    	    var imageData = ctx.getImageData(point1.x + Crafty.viewport.x, point1.y + Crafty.viewport.y, point2.x - point1.x, point2.y - point1.y);
	    	    
	    	    for (var x = 0; x < imageData.width; x++) {
	    	    	for (var y = 0; y < imageData.height; y++) {
	    	    		var alphaOffset = (y * imageData.width + x) * 4 + 3;
	    	    		imageData.data[alphaOffset] = 0;	// set alpha to 0
	    	    	}
	    	    }
	    	    ctx.putImageData(imageData, point1.x + Crafty.viewport.x, point1.y + Crafty.viewport.y);
	        }

	        // set up pixel buffers

	        // look for edges and draw a collision boundary
	        // only when there was an explosion and the collision data needs to be redrawn
	        // otherwise, draw image data along with collision data
	        if(this.isDirty) {
		        var imageData = ctx.getImageData(Crafty.viewport.x, Crafty.viewport.y, canvasWidth, canvasHeight);
		        var buf = new ArrayBuffer(imageData.data.length);
		        var buf8 = new Uint8ClampedArray(buf);
		        var data = new Uint32Array(buf);
	        	this.collisionMap = [];
//		        var collisionData = new Uint32Array(this.collisionBuffer);
		        
		        // copy image data into buffer
	        	buf8.set(imageData.data);
	
	            // deleting existing fixtures for collision
	    	    var fixture = this.body.GetFixtureList();
	    	    while(fixture) {
	    	    	var nextFixture = fixture.GetNext();
	    	    	this.body.DestroyFixture(fixture);
	    	    	fixture = nextFixture;	    	    	
	    	    }
	    	    
		        // TODO handle endianness later
		        // Determine whether Uint32 is little- or big-endian, see https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
	//	        data[1] = 0x0a0b0c0d;
	//	        var isLittleEndian = true;
	//	        if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
	//	            buf[7] === 0x0d) {
	//	            isLittleEndian = false;
	//	        }
	//	        if (isLittleEndian) {
		            for (var y = 1; y < canvasHeight - 1; y++) {
		                for (var x = 1; x < canvasWidth - 1; x++) {
		    	    		var currentPixel = y * canvasWidth + x;
		                	if(data[currentPixel] >> 24 !== 0x0) {
			    	    		var alphaTopLeft = (y - 1) * canvasWidth + (x - 1);
			    	    		var alphaTop = (y - 1) * canvasWidth + x;
			    	    		var alphaTopRight = (y - 1) * canvasWidth + (x + 1);
			    	    		var alphaLeft = y * canvasWidth + (x - 1);
			    	    		var alphaRight = y * canvasWidth + (x + 1);
			    	    		var alphaBottomLeft = (y + 1) * canvasWidth + (x - 1);
			    	    		var alphaBottom = (y + 1) * canvasWidth + x;
			    	    		var alphaBottomRight = (y + 1) * canvasWidth + (x + 1);

			    	    		// checks for where the ground ends and the sky begins (edges)
			    	    		// does this by checking if any adjacent pixels are transparent
			    	    		if(data[alphaTopLeft] >> 24 === 0x0 || data[alphaTop] >> 24 === 0x0 || data[alphaTopRight] >> 24 === 0x0 || 
			    	    				data[alphaLeft] >> 24 === 0x0 || data[alphaRight] >> 24 === 0x0 || 
			    	    				data[alphaBottomLeft] >> 24 === 0x0 || data[alphaBottom] >> 24 === 0x0 || data[alphaBottomRight] >> 24 === 0x0) {
			    	    			
			    	    			// if debugging, draw the actual line and save the collision map
			    		        	if(this.isDebug) {
					                    data[currentPixel] = 0xff000000;
			    		        		this.collisionMap.push({x: x, y: y});
										console.log("added collision fixture at " + x + ", " + y + " to " + this[0]);
			    		        	}
			    	    			
									// add new collision fixture
									var pixel = new b2PolygonShape;
									pixel.SetAsOrientedBox(1 / PIXEL2METER_RATIO, 1 / PIXEL2METER_RATIO, new b2Vec2(x / PIXEL2METER_RATIO, (y - GROUND_HEIGHT) / PIXEL2METER_RATIO), 0);
									  
									var fixture = new b2FixtureDef();
									fixture.shape = pixel;
									this.body.CreateFixture(fixture);
									
			    	    		}
		                	}
		                }
		            }
	//	        }
	//	        } else {
	//	            for (y = 1; y < canvasHeight - 1; y++) {
	//	                for (x = 1; x < canvasWidth - 1; x++) {
	//	                	if(data[y * canvasWidth + x] & 0x000000ff !== 0x0) {
	//		    	    		var alphaTopLeft = (y - 1) * canvasWidth + (x - 1);
	//		    	    		var alphaTop = (y - 1) * canvasWidth + x;
	//		    	    		var alphaTopRight = (y - 1) * canvasWidth + (x + 1);
	//		    	    		var alphaLeft = y * canvasWidth + (x - 1);
	//		    	    		var alphaRight = y * canvasWidth + (x + 1);
	//		    	    		var alphaBottomLeft = (y + 1) * canvasWidth + (x - 1);
	//		    	    		var alphaBottom = (y + 1) * canvasWidth + x;
	//		    	    		var alphaBottomRight = (y + 1) * canvasWidth + (x + 1);
	//	
	//		    	    		if(data[alphaTopLeft] & 0x000000ff === 0x0 || data[alphaTop] & 0x000000ff === 0x0 || data[alphaTopRight] & 0x000000ff === 0x0 || 
	//		    	    				data[alphaLeft] & 0x000000ff === 0x0 || data[alphaRight] & 0x000000ff === 0x0 || 
	//		    	    				data[alphaBottomLeft] & 0x000000ff === 0x0 || data[alphaBottom] & 0x000000ff === 0x0 || data[alphaBottomRight] & 0x000000ff === 0x0) {
	//			                    data[y * canvasWidth + x] = 0x000000ff;
	//		    	    		}
	//	                	}
	//	                }
	//	            }
	//	        }

	        	if(this.isDebug) {
			        imageData.data.set(buf8);
		    	    ctx.putImageData(imageData, Crafty.viewport.x, Crafty.viewport.y);
	        	}

	    	    this.isDirty = false;
	        }
	        else {
	        	// if debugging, draw the collision map
	        	if(this.isDebug) {
			        var imageData = ctx.getImageData(Crafty.viewport.x, Crafty.viewport.y, canvasWidth, canvasHeight);
			        
			        // add collision to existing image
		            for (var i = 0; i < this.collisionMap.length; i++) {
	    	    		var currentPixel = (this.collisionMap[i].y * canvasWidth + this.collisionMap[i].x) * 4;
	        			imageData.data[currentPixel] = 0;
	        			imageData.data[currentPixel + 1] = 0;
	        			imageData.data[currentPixel + 2] = 0;
	        			imageData.data[currentPixel + 3] = 255;
		            }
		            
		    	    ctx.putImageData(imageData, Crafty.viewport.x, Crafty.viewport.y);
	        	}
	        }
		});
		
		this.bind("ExplodePixels", function(collision) {
			// TODO change to circle
			this.deletedPixels.push({point1: {x: collision.entity.x - 50, y: collision.entity.y - 50}, point2: {x: collision.entity.x + 50, y: collision.entity.y + 50}});
			this.isDirty = true;
		});
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
//	createBaseTile(0, 288, 1);
//	createBaseTile(16, 288, 1);
//	createBaseTile(32, 288, 1);
//	createBaseTile(48, 288, 1);
//	createBaseTile(64, 288, 1);
//	createBaseTile(80, 288, 1);
//	createBaseTile(96, 288, 1);
//	createBaseTile(112, 288, 1);
//	createBaseTile(128, 288, 1);
//	createBaseTile(144, 288, 1);
//	createBaseTile(160, 288, 1);
//	createBaseTile(176, 288, 1);
//	createBaseTile(192, 288, 1);
//	createBaseTile(208, 288, 1);
//	createBaseTile(224, 288, 1);
//	createBaseTile(240, 288, 1);
//	createSurfaceTile(0, 288, 2);
//	createSurfaceTile(16, 288, 2);
//	createSurfaceTile(32, 288, 2);
//	createSurfaceTile(48, 288, 2);
//	createSurfaceTile(64, 288, 2);
//	createSurfaceTile(80, 288, 2);
//	createSurfaceTile(96, 288, 2);
//	createSurfaceTile(112, 288, 2);
//	createSurfaceTile(224, 288, 2);
//	createSurfaceTile(240, 288, 2);

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
//	createBaseTile(128, 272, 1);
//	createBaseTile(144, 272, 1);
//	createBaseTile(160, 272, 1);
//	createBaseTile(176, 272, 1);
//	createBaseTile(192, 272, 1);
//	createBaseTile(208, 272, 1);
//	createSurfaceTile(128, 272, 2);
//	createSurfaceTile(144, 272, 2);
//	createSurfaceTile(192, 272, 2);
//	createSurfaceTile(208, 272, 2);
	
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
//	createBaseTile(160, 256, 1);
//	createBaseTile(176, 256, 1);
//	createSurfaceTile(160, 256, 2);
//	createSurfaceTile(176, 256, 2);

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
//	createBaseTile(496, 288, 1);
//	createBaseTile(512, 288, 1);
//	createBaseTile(528, 288, 1);
//	createBaseTile(544, 288, 1);
//	createBaseTile(560, 288, 1);
//	createBaseTile(576, 288, 1);
//	createBaseTile(592, 288, 1);
//	createBaseTile(608, 288, 1);
//	createBaseTile(624, 288, 1);
//	createBaseTile(640, 288, 1);
//	createSurfaceTile(496, 288, 2);
//	createSurfaceTile(512, 288, 2);
//	createSurfaceTile(528, 288, 2);
//	createSurfaceTile(544, 288, 2);
//	createSurfaceTile(560, 288, 2);
//	createSurfaceTile(640, 288, 2);

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
//	createBaseTile(576, 272, 1);
//	createBaseTile(592, 272, 1);
//	createBaseTile(608, 272, 1);
//	createBaseTile(624, 272, 1);
//	createSurfaceTile(576, 272, 2);
//	createSurfaceTile(592, 272, 2);
//	createSurfaceTile(608, 272, 2);
//	createSurfaceTile(624, 272, 2);	
	
	// mountain
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[800, 96],
//	                [832, 96]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(800, 96, 1);
//	createBaseTile(816, 96, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[768, 112],
//	                [848, 112]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(768, 112, 1);
//	createBaseTile(784, 112, 1);
//	createBaseTile(800, 112, 1);
//	createBaseTile(816, 112, 1);
//	createBaseTile(832, 112, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[752, 128],
//	                [864, 128]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(752, 128, 1);
//	createBaseTile(768, 128, 1);
//	createBaseTile(784, 128, 1);
//	createBaseTile(800, 128, 1);
//	createBaseTile(816, 128, 1);
//	createBaseTile(832, 128, 1);
//	createBaseTile(848, 128, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[816, 144],
//	                [880, 144]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(816, 144, 1);
//	createBaseTile(832, 144, 1);
//	createBaseTile(848, 144, 1);
//	createBaseTile(864, 144, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[800, 160],
//	                [896, 160]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(800, 160, 1);
//	createBaseTile(816, 160, 1);
//	createBaseTile(832, 160, 1);
//	createBaseTile(848, 160, 1);
//	createBaseTile(864, 160, 1);
//	createBaseTile(880, 160, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[816, 176],
//	                [912, 176]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(816, 176, 1);
//	createBaseTile(832, 176, 1);
//	createBaseTile(848, 176, 1);
//	createBaseTile(864, 176, 1);
//	createBaseTile(880, 176, 1);
//	createBaseTile(896, 176, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[816, 192],
//	                [928, 192]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(816, 192, 1);
//	createBaseTile(832, 192, 1);
//	createBaseTile(848, 192, 1);
//	createBaseTile(864, 192, 1);
//	createBaseTile(880, 192, 1);
//	createBaseTile(896, 192, 1);
//	createBaseTile(912, 192, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[832, 208],
//	                [944, 208]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(832, 208, 1);
//	createBaseTile(848, 208, 1);
//	createBaseTile(864, 208, 1);
//	createBaseTile(880, 208, 1);
//	createBaseTile(896, 208, 1);
//	createBaseTile(912, 208, 1);
//	createBaseTile(928, 208, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[832, 224],
//	                [960, 224]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(832, 224, 1);
//	createBaseTile(848, 224, 1);
//	createBaseTile(864, 224, 1);
//	createBaseTile(880, 224, 1);
//	createBaseTile(896, 224, 1);
//	createBaseTile(912, 224, 1);
//	createBaseTile(928, 224, 1);
//	createBaseTile(944, 224, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[848, 240],
//	                [976, 240]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(848, 240, 1);
//	createBaseTile(864, 240, 1);
//	createBaseTile(880, 240, 1);
//	createBaseTile(896, 240, 1);
//	createBaseTile(912, 240, 1);
//	createBaseTile(928, 240, 1);
//	createBaseTile(944, 240, 1);
//	createBaseTile(960, 240, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[848, 256],
//	                [992, 256]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(848, 256, 1);
//	createBaseTile(864, 256, 1);
//	createBaseTile(880, 256, 1);
//	createBaseTile(896, 256, 1);
//	createBaseTile(912, 256, 1);
//	createBaseTile(928, 256, 1);
//	createBaseTile(944, 256, 1);
//	createBaseTile(960, 256, 1);
//	createBaseTile(976, 256, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[864, 272],
//	                [1008, 272]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(864, 272, 1);
//	createBaseTile(880, 272, 1);
//	createBaseTile(896, 272, 1);
//	createBaseTile(912, 272, 1);
//	createBaseTile(928, 272, 1);
//	createBaseTile(944, 272, 1);
//	createBaseTile(960, 272, 1);
//	createBaseTile(976, 272, 1);
//	createBaseTile(992, 272, 1);
//
//    Crafty.e("2D, DOM, Box2D, explodable, ground")
//		.attr({x: 0, y: 0})
//	    .box2d({
//	        bodyType: 'static',
//	        shape: [[864, 288],
//	                [1024, 288]]
//	    })
//        .bind('HitByExplosion', function(attacker) {
//        	console.log("Exploding " + this[0]);
//            destroyedBodies.push(this);
//        });
//	createBaseTile(864, 288, 1);
//	createBaseTile(880, 288, 1);
//	createBaseTile(896, 288, 1);
//	createBaseTile(912, 288, 1);
//	createBaseTile(928, 288, 1);
//	createBaseTile(944, 288, 1);
//	createBaseTile(960, 288, 1);
//	createBaseTile(976, 288, 1);
//	createBaseTile(992, 288, 1);
//	createBaseTile(1008, 288, 1);
}
