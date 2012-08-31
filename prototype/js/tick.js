Crafty.bind("EnterFrame", function() {
	// tick to destroy bodies marked for removal
	while(destroyedBodies.length > 0) {
	    var entity = destroyedBodies.pop();
	    console.log("Removing entity " + entity[0] + " from the scene");
	    
	    if(entity.__c["Box2D"]) {
	    	console.log("  destroying body first");
        	Crafty.box2D.world.DestroyBody(entity.body);
	    }
    	entity.destroy();
	}

	// tick to create bodies outside of collision calculation
	// note, this must initialize themselves in a function outside of the init constructor for this to work
	while(queuedBodies.length > 0) {
		var entity = queuedBodies.pop();
		console.log("Adding entity " + entity[0] + " to the scene");
		
		if(entity.__c["ProjectileExplosion"]) {
			entity.Explode("explosion");
		}
	}
});    