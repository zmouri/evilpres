var IMG_SKY = "img/Sky_back_layer.png";

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
