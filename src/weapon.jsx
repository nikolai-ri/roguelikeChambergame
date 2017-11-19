export default class Weapon{
    /**
     * Is called when a weapon is created.
     * @constructor
     * @param number x - x-Position of the weapon. 
     * @param number y - y-Position of the weapon.
     * @param number gameReference  - Reference to the game object.
     * @param number displayReference  - Reference to the display object
     */
    constructor(x, y, gameReference, displayReference){
        this._x = x;
        this._y = y;
        this._draw;
        this.gameRef = gameReference;
    }

    _draw = function(){
        // Draw the symbol with color yellow to position x and y.
        this.gameRef.state.Game.display.draw(this._x, this._y, "", "", "yellow");
    }
}