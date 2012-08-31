var contactListener = {
	BeginContact : function(contact) {
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var entityA = fixtureA.GetBody().GetUserData();
		var entityB = fixtureB.GetBody().GetUserData();
		
		if(entityA.__c["ProjectileExplosion"] || entityB.__c["ProjectileExplosion"]) {
    	    if (fixtureA.IsSensor()) {	// A is the explosion
    	    	console.log("entity " + entityB[0] + " hit by " + entityA[0]);
    	    	entityB.trigger("HitByExplosion", entityA.attacker);
    	    }
    	    else { // B is the explosion
    	    	console.log("entity " + entityA[0] + " hit by " + entityB[0]);
    	    	entityA.trigger("HitByExplosion", entityB.attacker);
    	    }
		}
		
//			if(entityA.__c["explodable"]) {
//	 			if(entityB.__c["ProjectileExplosion"]) {
//        	    	console.log("entity " + entityA[0] + " exploding from " + entityB[0]);
//	 				entityA.trigger("HitByExplosion", entityB.attacker);
//	 			}
//			}
//			
//			if(entityB.__c["explodable"]) {
//	 			if(entityA.__c["ProjectileExplosion"]) {
//        	    	console.log("entity " + entityB[0] + " exploding from " + entityA[0]);
//	 				entityB.trigger("HitByExplosion", entityA.attacker);
//	 			}
//			}
		
		if(entityA.__c["water"]) {
 			console.log("entity " + entityB[0] + " fell into a bottomless water pit");
 			
 			if(entityB.__c["Character"]) {
 				entityB.trigger("Drowned");
 			}
 			else {
 				destroyedBodies.push(entityB);
 			}
		} 
		
		if(entityB.__c["water"]) {
 			console.log("entity " + entityA[0] + " fell into a bottomless water pit");
 			
 			if(entityA.__c["Character"]) {
 				entityA.trigger("Drowned");
 			}
 			else {
 				destroyedBodies.push(entityA);
 			}
		}
		
		// TODO: workaround so that the missile does not immediately hit the attacker
		// need to figure out how to avoid this
		if(entityA.__c["LineOfSightAttack"] && !entityB.__c["lineOfSightAttacker"]) {
 			console.log("los missile " + entityA[0] + " hit something " + entityB[0]);
 			entityA.trigger("Explode");
		}
		
		if(entityB.__c["LineOfSightAttack"] && !entityA.__c["lineOfSightAttacker"]) {
 			console.log("los missile " + entityB[0] + " hit something " + entityA[0]);
 			entityB.trigger("Explode");
		}
	},
	
	EndContact : function(contact) {},
	PreSolve : function(contact, manifold) {},
	PostSolve : function(contact, manifold) {},
};