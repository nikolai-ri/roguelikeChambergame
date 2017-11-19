import ROT from "rot-js";

export default class FinalEnemy{
    /**
     * Is called when a finalenemy is created.
     * @constructor
     * @param number x - x-Position of the finalenemy. 
     * @param number y - y-Position of the finalenemy.
     * @param number gameReference  - Reference to the game object.
     * @param number displayReference  - Reference to the display object
     */
    constructor(x, y, gameReference, displayReference){
        this._x = x;
        this._y = y;
        this.health = 200;
        this.gameRef = gameReference;
        this.displayRef = displayReference;
        this._draw();
    }

    _draw = function() {
        this.gameRef.state.Game.map[this._x + "," + this._y] = "finalEnemy";
        this.gameRef.state.Game.display.draw(this._x, this._y, "", "black");
    }

    /**
     * The final enemy object is registered on the rot scheduler and therefore needs an act function.
     * This function finds the shortest path to the player, and moves the final enemy along this path towards the player.
     */
    act = function() {
        
        let x = this.gameRef.state.Game.player.getX();
        let y = this.gameRef.state.Game.player.getY();
        let that = this.gameRef;
        let passableCallback = function(x, y) {
            return (x + "," + y in that.state.Game.map);
        }
        let astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});
     
        let path = [];
        let pathCallback = function(x, y) {
            path.push([x, y]);
        }
        astar.compute(this._x, this._y, pathCallback);
        
        path.shift(); /* remove Pedro's position */
        if(path.length === 0 || path.length === 1 || path.length === 2){
            this._draw();
            this.gameRef.state.Game.schedulerRef.remove(this.gameRef.state.Game.finalEnemy);
            this.gameRef.state.Game.player.gotCaught = true;
            return;
        } 
        
        this.gameRef.state.Game.display.draw(this._x, this._y, "", "", "lightgrey")
        this.gameRef.state.Game.map[this._x + "," + this._y] = "";

        x = path[0][0];
        y = path[0][1];
        this._x = x;
        this._y = y;
        this._draw();   
        
    }
}