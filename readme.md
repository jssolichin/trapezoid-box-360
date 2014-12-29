[Trapezoid Box 360](http://jssolichin.com/trapezoid-box-360)
===========================

Trapezoid Box 360 is a holographic game originally designed for [UCLA Game Lab's Cocktail Cabinet](http://games.ucla.edu/game/ucla-game-lab-cocktail-cabinets/). It is an asymmetric multiplayer tribute to the classic breakout with a hint of color theory. Three player (red, green, and blue) works together to fill the world with all colors (through additive color combinations / white), against one player (opacity / grey), whose goal is to make everything disappear. 

![hero](http://jssolichin.com/wp-content/uploads/2013/11/1477577_10152069193140309_1228087979_n.jpg)
![set up](http://jssolichin.com/wp-content/uploads/2014/02/IMG_1158-1024x704.jpg)
![happy](http://jssolichin.com/wp-content/uploads/2014/01/DSC_3096.jpg)
![group](http://jssolichin.com/wp-content/uploads/2014/01/DSC_3163.jpg)
![intense](http://jssolichin.com/wp-content/uploads/2014/01/DSC_3334.jpg)

## Rules

### Goal
* Colored paddles (red, green, blue) work together to try and make every brick white by adding their own color to each brick.
* Opacity paddle (grey) tries to make every brick disappear by reducing each bricks opacity. 
* Game ends when all bricks have disappeared, or all bricks are white (meaning all paddles have added their color to each brick).

### Gameplay
* Each player controls a paddle (keyboard keys, in the demo: hgft, awsd, ilkj, (%&\ -- default on cocktail cabinet arduino input)
* When a ball bounces on a paddle, it takes the color/opacity of that paddle.
* If a ball has taken a color/opacity, when it hits the bricks in the ceiling, it will add to it.
* A ball will continue to be a color/opacity until it hits the floor or is hit by another paddle.

## How to use
* Refer to images for construction of hologram viewer (we created a trapezoid in clear acryllic and placed it on top of a 24" monitor).
* Run the file on any webserver that can serve javascript and open [index.html](index.html). TB360 uses WebGL and so you need a relatively new browser to run it. 
* To edit keys used to move the paddles, edit the bottom of [js/main.js](js/main.js).

## Authors
* [Alex Lu](http://xander.lu/)
* [Kevin Lin](http://kevinl.in)
* [Jonathan Solichin](http://jssolichin.com)

# Special Thanks
* [THREE.js](https://github.com/mrdoob/three.js)
* [UCLA Game Lab](http://games.ucla.edu/)
