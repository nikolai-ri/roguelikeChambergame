import ROT from "rot-js";

export default class Player{
    /**
     * Is called when a player is created.
     * @constructor
     * @param number x - x-Position of the player. 
     * @param number y - y-Position of the player.
     * @param number gameReference  - Reference to the game object.
     * @param number displayReference  - Reference to the display object
     */
    constructor(x, y, gameReference, displayReference){
        this._x = x;
        this._y = y;
        this.gameRef = gameReference;
        this.displayRef = displayReference;
        this.health = gameReference.state.playerHealth;
        // this boolean is used as a flag, to catch the case, that the finalenemy is closer then 2 boxes from the player. Then it is set to true, and the player cannot move more then 5 boxes around the final enemy.
        this.gotCaught = false;
        this._draw(this.gameRef, this.displayRef);
        
    }

    /**
     * Draws the players box the map.
     */
    _draw = function(){
        // saves the string player to the map object, so stuff can be made with this position if necessary
        this.gameRef.state.Game.map[this._x + "," + this._y] = "player";
        // Draw the symbol with color blue to position x and y.
        this.gameRef.state.Game.display.draw(this._x, this._y, "", "", "blue");
    }

    /**
     * The player object is added to the rot scheduler and hence needs this function.
     * When playing against the final enemy, the scheduler needs to schedule the final enemy and the player,
     * and calls the act functions when its the players or the final enemies draw.
     */
    act = function(){
        this.gameRef.state.Game.engine.lock();
        // only listens to player input, when its the players turn
        window.addEventListener("keydown", this);
    }

    /**
     * This function handles all the events connected with the player and calls appropriate functions if necessary.
     * @param object e - The fired event.
     */
    handleEvent= function(e){
        if(this.gameRef.state.Game === null) return;
        
        let keyMap = {};
        keyMap[38] = 0;
        keyMap[33] = 1;
        keyMap[39] = 2;
        keyMap[34] = 3;
        keyMap[40] = 4;
        keyMap[35] = 5;
        keyMap[37] = 6;
        keyMap[36] = 7;

        let code = e.keyCode;
        
        // do not take the keydown, if its event is not defined
        if(!(code in keyMap)) {
            window.removeEventListener("keydown", this);
            this.gameRef.state.Game.engine.unlock();
            return;
        }
        
        // convert keymap to direction and assign it
        let diff = ROT.DIRS[8][keyMap[code]];
        let newX = this._x + diff[0];
        let newY = this._y + diff[1];
        
        let newKey = newX + "," + newY;

        // do not move in this direction, if there is a wall there
        if(!(newKey in this.gameRef.state.Game.map)) {
            window.removeEventListener("keydown", this);
            this.gameRef.state.Game.engine.unlock();
            return;
        }
        
        // This Block handles the fight decreasing health of the enemies
        
        if(this.gameRef.state.Game.map[newKey] === "enemy" || this.gameRef.state.Game.map[newKey] === "finalEnemy") {

            this.gameRef.props.onGameWrapperStylingChange(this.gameRef.state.referenceGameComponent);
            
            if(this.health <= 0){
                window.removeEventListener("keydown", this);
                this.gameRef.props.onPlayerKilled(this.gameRef.state.referenceGameComponent);
                this.gameRef.state.Game.engine.unlock();
                this.gameRef.stopGame(this.gameRef);
                return;
            }
            
            if(this.gameRef.state.Game.map[newKey] === "enemy"){
                if(this.gameRef.state.Game.enemies[newKey].health <= 0){
                    this.gameRef.state.Game.map[newKey] = "";
                    delete this.gameRef.state.Game.enemies[newKey];
                }
            }
            
            if(this.gameRef.state.Game.map[newKey] === "enemy"){
                this.gameRef.state.Game.enemies[newKey].health -= this.gameRef.state.currentAttack; 
            } else if (this.gameRef.state.Game.map[newKey] === "finalEnemy"){
                this.gameRef.state.Game.finalEnemy.health -= this.gameRef.state.currentAttack; 
            }
        
            
            if(this.gameRef.state.Game.map[newKey] === "finalEnemy"){
                if(this.gameRef.state.Game.finalEnemy.health <= 0){
                    this.gameRef.state.Game.map[newKey] = "";
                    delete this.gameRef.state.Game.enemies[newKey];
                    this.gameRef.props.onFinalEnemyKilled(this.gameRef.state.referenceGameComponent);
                    window.removeEventListener("keydown", this);
                    this.gameRef.state.Game.engine.unlock();
                    this.gameRef.stopGame(this.gameRef);
                    return;
                }
            }
            
            if(this.gameRef.state.Game.map[newKey] === "enemy"){
                this._handleFight("enemy", this.gameRef.state.referenceGameComponent).then(() => this.health = this.gameRef.state.playerHealth);
            } else if (this.gameRef.state.Game.map[newKey] === "finalEnemy") {
                this._handleFight("finalEnemy", this.gameRef.state.referenceGameComponent).then(() => this.health = this.gameRef.state.playerHealth);
            }
            window.removeEventListener("keydown", this);
            this.gameRef.state.Game.engine.unlock();
            return;
            }
            
        // this block handles the leveling up due to health
        else if(this.gameRef.state.Game.map[newKey] === "health"){
            delete this.gameRef.state.Game.health[newKey];
            this.gameRef.state.Game.map[newKey] = "";
            this._handleFight("health", this.gameRef.state.referenceGameComponent).then(() => this.health = this.gameRef.state.playerHealth);
        }
        
        // this block handles the leveling up due to a weapon
        else if(this.gameRef.state.Game.map[newKey] === "weapon"){
            delete this.gameRef.state.Game.weapons[newKey];
            this.gameRef.state.Game.map[newKey] = "";
            this._handleFight("weapon", this.gameRef.state.referenceGameComponent);
        }
        
        else if(this.gameRef.state.Game.map[newKey] === "doorway"){
            window.removeEventListener("keydown", this);
            this.gameRef.state.Game.engine.unlock();
            this._playerJumpToNextDungeon(this.gameRef.state.referenceGameComponent);
            this.gameRef._reloadMap();
            return;
        }

        this.gameRef.state.Game.display.draw(this._x, this._y, "", "", "lightgrey");
        this.gameRef.state.Game.map[this._x + "," + this._y] = "";
        
        this._x = newX;
        this._y = newY;
        
        // only start to draw object when they appear in the field of view
        if(!this.gotCaught){
            let that = this;
            that.gameRef.state.Game.fieldOfView.compute(that._x, that._y, 6, function(x, y, r, visibility) {
                let key = x + "," + y;
                if(key in that.gameRef.state.Game.map){
                    if(that.gameRef.state.Game.map[key] === ""){
                        that.gameRef.state.Game.display.draw(x, y, "", "", key in that.gameRef.state.Game.map ? "lightgrey": "#24281e");
                    } else if (that.gameRef.state.Game.map[key] === "enemy"){
                        that.gameRef.state.Game.enemies[key]._draw();
                    } else if (that.gameRef.state.Game.map[key] === "health"){
                        that.gameRef.state.Game.health[key]._draw();
                    } else if (that.gameRef.state.Game.map[key] === "weapon"){
                        that.gameRef.state.Game.weapons[key]._draw();
                    } else if (that.gameRef.state.Game.map[key] === "doorway"){
                        that.gameRef.state.Game.doorway._draw();
                    }
                }  
            });
        } else if (this.gotCaught){
            let that = this.gameRef;
            // if the player got caught, the whole map, except for a square around the final enemy is basically deleted, thereby trapping the player with the finalenemy
            Object.keys(this.gameRef.state.Game.map).forEach(function(element){
                let key = element.split(",");
                if(key[1] < parseInt(that.state.Game.finalEnemy._y, 10) - 5 || key[1] > parseInt(that.state.Game.finalEnemy._y, 10) + 5){
                    if(that.state.Game.map.hasOwnProperty(element)) delete that.state.Game.map[element];
                };
                if(key[0] < parseInt(that.state.Game.finalEnemy._x, 10) - 5 || key[0] > parseInt(that.state.Game.finalEnemy._x, 10) + 5){
                    if(that.state.Game.map.hasOwnProperty(element)) delete that.state.Game.map[element];
                };
                
            });

            this.gameRef.state.Game.player.gotCaught = false;  
        }
        
        
        this._draw("");
        window.removeEventListener("keydown", this);
        this.gameRef.state.Game.engine.unlock();
            
    }

    /**
     * This function handles a fight between the player and an enemy on the layer of the game component.
     * @param number damage - Gives the amount of damage a fight does on the player.
     * @param object referenceGameObj - Reference to the game object.
     */
    _handleFight = function(damage, referenceGameObj){
        return this.gameRef.props.onPlayerFight(damage, referenceGameObj);
    }

    /**
     * Getter function for the x-position of the player.
     */
    getX = function() { return this._x; }

    /**
     * Getter function for the y-position of the player.
     */
    getY = function() { return this._y; }

    /**
     * Handles a jump of the player to the next level/dungeon on the layer of the game component.
     */
    _playerJumpToNextDungeon = function(referenceGameObj){
        return this.gameRef.props.onNewDungeon(referenceGameObj);
    }
}
