var IMG_SPRITE = "img/sprite_bman.png";
var IMG_EXPLOSION = "img/explosion.png";

Crafty.sprite(16, IMG_SPRITE, {
    grass1: [0, 0],
    grass2: [1, 0],
    grass3: [2, 0],
    grass4: [3, 0],
    flower: [0, 1],
    bush: [0, 2],
    player_bman: [0, 3],
    player_iman: [0, 4],
    projectile: [4, 0],
    lineofsight: [4, 1],
    empty: [4, 0],
});

Crafty.sprite(128, IMG_EXPLOSION, {
    explosion: [0, 0],
});