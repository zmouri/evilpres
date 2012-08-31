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
    SlingshotArrow: function(x, y, angle, color) {    		
    	var arrowSize = 20;

		var point1 = [x, y - arrowSize * Math.sqrt(3) / 4];
		var point2 = [x - arrowSize / 2, y + arrowSize * Math.sqrt(3) / 4];
		var point3 = [x + arrowSize / 2, y + arrowSize * Math.sqrt(3) / 4];
    	this.SolidPolygon([point1, point2, point3], color, angle, [x, y])
    		.attr({ x: x, y: y });
        return this;
    }
});