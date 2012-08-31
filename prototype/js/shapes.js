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