export default class Enemy {
    /**
     * Is called when an enemy is created.
     * @constructor
     * @param number x - x-Position of the enemy. 
     * @param number y - y-Position of the enemy.
     * @param number gameReference  - Reference to the game object.
     * @param number displayReference  - Reference to the display object
     */
    constructor(x, y, gameReference, displayReference){
        this._x = x;
        this._y = y;
        this.health = 40;
        this._draw;
        this.gameRef = gameReference;
    }

    _draw = function(){
        // Draw the symbol with color red to position x and y.
        this.gameRef.state.Game.display.draw(this._x, this._y, "", "", "red");  
    }
}