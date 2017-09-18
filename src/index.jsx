import React from 'react';
import ReactDOM from 'react-dom';
import ROT from "rot-js";
import './index.css';

// implement next:

// implement playerDeath
// implement end of game
// (score: points / time)
// implement highscore list

class Stats extends React.Component{
    
    constructor(props){
        super(props);
        
        this.state = {
                playerHealth: null,
                currentWeapon: null,
                dungenon: null,
                playerPoints: null
        };
    }
    
    componentWillMount(){
        this.setState({
            playerHealth: this.props.playerHealth,
            currentWeapon: this.props.currentWeapon,
            dungeon: this.props.dungeon,
            playerPoints: this.props.playerPoints
        });
    }
    
    componentWillReceiveProps(nextState){
        this.setState({
            playerHealth: nextState.playerHealth,
            currentWeapon: nextState.currentWeapon,
            dungeon: nextState.dungeon,
            playerPoints: nextState.playerPoints
        });
    }
    
    render(){
        
        return(
                <div><span>{"Current Player Points: " + this.state.playerPoints + "| Current Playerhealth: " + this.state.playerHealth + " | Current Weapon: " + this.state.currentWeapon + " | Current Dungeon: " + this.state.dungeon}</span></div>
        );
    }
}
class Map extends React.Component{
    constructor(props){
        super(props);

        this.state = {
                Game: {},
                playerHealth: null,
                referenceGameObject: null,
                currentWeapon: null,
                dungeon: null
        }
      
    }
   
    componentWillMount(){

        ROT.RNG.setSeed(Date.now());
        
        //On mounting the object holding the game and its players is created. Afterwards its initialization function handels the game start.
        this.setState({
            playerHealth: this.props.playerHealth,
            referenceGameObject: this.props.referenceGameObject,
            currentWeapon: this.props.currentWeapon,
            dungeon: this.props.dungeon,
            Game : this.createGameObject(false) // the boolean indicates, that this is not the final dungeon, i.e. no final enemy shall be created
        }, () => this.state.Game.init());
    }
    
    componentWillReceiveProps(nextState){
        this.setState({
            playerHealth: nextState.playerHealth,
            currentWeapon: nextState.currentWeapon,
            dungeon: nextState.dungeon
        });
    }
    
    // is called when a player jumps to the next dungeon
    _reloadMap(){

        // no final enemy in the first two dungeons
        if(this.state.dungeon <= 2){
            document.getElementById("completeGameWrapperId").removeChild(document.getElementById("completeGameWrapperId").childNodes[2]);
            this.setState({
                Game: this.createGameObject(false)
            }, () => this.state.Game.init());
                        
        } else if(this.state.dungeon === 3){
            document.getElementById("completeGameWrapperId").removeChild(document.getElementById("completeGameWrapperId").childNodes[2]);
            this.setState({
                Game: this.createGameObject(true)
            }, () => this.state.Game.init());
        }
        
    }
   
    
    createGameObject(finalDungeon){
        let that = this;
        
        //constructor for the object player
        let Player = function(x, y){
            this._x = x;
            this._y = y;
            this.health = that.state.playerHealth;
            this.currentWeapon = that.state.currentWeapon;
            // this boolean is used as a flag, to catch the case, that the finalenemy is closer then 2 boxes from the player. Then it is set to true, and the player cannot move more then 5 boxes around the final enemy.
            this.gotCaught = false;
            this._draw();

        }
        
        // In the prototype so valid for every newly created player.
        Player.prototype._draw = function(){
            // Draw the symbol with color blue to position x and y.
            that.state.Game.map[this._x + "," + this._y] = "player";
            that.state.Game.display.draw(this._x, this._y, "", "", "blue");
        }
        
        // Every object that is added on the ROT scheduler needs this function
        Player.prototype.act = function(){
            that.state.Game.engine.lock();
            // only listens to player input, when its the players turn
            window.addEventListener("keydown", this);
        }
        
        // Handles all the events connected to the player such as fighting and moving
        Player.prototype.handleEvent= function(e){
            
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
                that.state.Game.engine.unlock();
                return;
            }
            
            // convert keymap to direction and assign it
            let diff = ROT.DIRS[8][keyMap[code]];
            let newX = this._x + diff[0];
            let newY = this._y + diff[1];
            
            let newKey = newX + "," + newY;

            // do not move in this direction, if there is a wall there
            if(!(newKey in that.state.Game.map)) {
                window.removeEventListener("keydown", this);
                that.state.Game.engine.unlock();
                return;
            }
            
            // This Block handles the fight decreasing health of the enemies
            
            if(that.state.Game.map[newKey] === "enemy" || that.state.Game.map[newKey] === "finalEnemy") {
                
                if(this.currentWeapon === "Knife"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 5; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 5; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "Baseball Bat"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 10; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 10; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "Colt"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 15; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 15; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "P90"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 20; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 20; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "MG5"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 25; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 25; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "AK47"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 30; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 30; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "Flamethrower"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 35;
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 35; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "Bazooka"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 40; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 40; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } else if(this.currentWeapon === "Energy Weapon"){
                    if(that.state.Game.map[newKey] === "enemy"){
                        that.state.Game.enemies[newKey].health -= 50; 
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    } else {
                        that.state.Game.finalEnemy.health -= 50;
                        that.props.handlePlayerPointsUp(that.state.referenceGameObject);
                    }
                } 
                   
                if(that.state.Game.map[newKey] === "enemy"){
                    if(that.state.Game.enemies[newKey].health <= 0){
                        that.state.Game.map[newKey] = "";
                        delete that.state.Game.enemies[newKey];
                    }
                }
                
                if(that.state.Game.map[newKey] === "finalEnemy"){
                    if(that.state.Game.finalEnemy.health <= 0){
                        that.state.Game.map[newKey] = "";
                        delete that.state.Game.enemies[newKey];
                        alert("Congratulations! You defeated the final enemy :-)!");
                    }
                }
                
                if(that.state.Game.map[newKey] === "enemy"){
                    this._handleFight("enemy", that.state.referenceGameObject).then(() => this.health = that.state.playerHealth);
                } else if (that.state.Game.map[newKey] === "finalEnemy") {
                    this._handleFight("finalEnemy", that.state.referenceGameObject).then(() => this.health = that.state.playerHealth);
                }
                window.removeEventListener("keydown", this);
                that.state.Game.engine.unlock();
                return;
            }
            
            // this block handles the leveling up due to health
            else if(that.state.Game.map[newKey] === "health"){
                delete that.state.Game.health[newKey];
                that.state.Game.map[newKey] = "";
                this._handleFight("health", that.state.referenceGameObject).then(() => this.health = that.state.playerHealth);
            }
            
            // this block handles the leveling up due to a weapon
            else if(that.state.Game.map[newKey] === "weapon"){
                delete that.state.Game.weapons[newKey];
                that.state.Game.map[newKey] = "";
                this._handleFight("weapon", that.state.referenceGameObject).then(() => this.currentWeapon = that.state.currentWeapon);
            }
            
            else if(that.state.Game.map[newKey] === "doorway"){

                this._playerJumpToNextDungeon(that.state.referenceGameObject);
                that._reloadMap();
                window.removeEventListener("keydown", this);
                that.state.Game.engine.unlock();
                return;
           }

            that.state.Game.display.draw(this._x, this._y, "", "", "lightgrey");
            that.state.Game.map[this._x + "," + this._y] = "";
            
            this._x = newX;
            this._y = newY;
            
            // only start to draw object when they appear in the field of view
            if(!this.gotCaught){
                that.state.Game.fieldOfView.compute(this._x, this._y, 6, function(x, y, r, visibility) {
                    let key = x + "," + y;
                    if(key in that.state.Game.map){
                        if(that.state.Game.map[key] === ""){
                            that.state.Game.display.draw(x, y, "", "", key in that.state.Game.map ? "lightgrey": "#24281e");
                        } else if (that.state.Game.map[key] === "enemy"){
                            that.state.Game.enemies[key]._draw();
                        } else if (that.state.Game.map[key] === "health"){
                            that.state.Game.health[key]._draw();
                        } else if (that.state.Game.map[key] === "weapon"){
                            that.state.Game.weapons[key]._draw();
                        } else if (that.state.Game.map[key] === "doorway"){
                            that.state.Game.doorway._draw();
                        }
                    }  
                });
            } else if (this.gotCaught){
                
                // if the player got caught, the whole map, except for a square around the final enemy is basically deleted, thereby trapping the player with the finalenemy
                Object.keys(that.state.Game.map).forEach(function(element){
                    let key = element.split(",");
                    if(key[1] < parseInt(that.state.Game.finalEnemy._y, 10) - 5 || key[1] > parseInt(that.state.Game.finalEnemy._y, 10) + 5){
                        if(that.state.Game.map.hasOwnProperty(element)) delete that.state.Game.map[element];
                    };
                    if(key[0] < parseInt(that.state.Game.finalEnemy._x, 10) - 5 || key[0] > parseInt(that.state.Game.finalEnemy._x, 10) + 5){
                        if(that.state.Game.map.hasOwnProperty(element)) delete that.state.Game.map[element];
                    };
                    
                });

                that.state.Game.player.gotCaught = false;  
                console.log(that.state.Game.map);
            }
            
            
            this._draw("");
            window.removeEventListener("keydown", this);
            that.state.Game.engine.unlock();
            
        }
        
        // this function handles the decreasing health of the player
        Player.prototype._handleFight = function(damage, referenceGameObj){
            return that.props.onPlayerFight(damage, referenceGameObj);
        }
        
        Player.prototype.getX = function() { return this._x; }
        
        Player.prototype.getY = function() { return this._y; }
        
        Player.prototype._playerJumpToNextDungeon = function(referenceGameObj){
            return that.props.onNewDungeon(referenceGameObj);
        }
        
        //constructor for the object enemy
        let Enemy = function(x, y){
            this._x = x;
            this._y = y;
            this.health = 40;
            this._draw;
        }
        
        // In the prototype so valid for every newly created enemy.
        Enemy.prototype._draw = function(){
            // Draw the symbol with color red to position x and y.
            that.state.Game.display.draw(this._x, this._y, "", "", "red");  
        }
        
        let FinalEnemy = function(x, y) {
            this._x = x;
            this._y = y;
            this.health = 200;
            this._draw();
        }
         
        FinalEnemy.prototype._draw = function() {
            that.state.Game.map[this._x + "," + this._y] = "finalEnemy";
            that.state.Game.display.draw(this._x, this._y, "", "black");
        }
        
        FinalEnemy.prototype.act = function() {
            
            let x = that.state.Game.player.getX();
            let y = that.state.Game.player.getY();
            
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
                that.state.Game.schedulerRef.remove(that.state.Game.finalEnemy);
                that.state.Game.player.gotCaught = true;
                return;
            } 
            
            that.state.Game.display.draw(this._x, this._y, "", "", "lightgrey")
            that.state.Game.map[this._x + "," + this._y] = "";

            x = path[0][0];
            y = path[0][1];
            this._x = x;
            this._y = y;
            this._draw();   
            
        }
        
        // constructor for object health
        let Health = function(x, y){
            this._x = x;
            this._y = y;
            this._draw;
        }
        
        // In the prototype so valid for every newly created health object.
        Health.prototype._draw = function(){
            // Draw the symbol with color green to position x and y.
            that.state.Game.display.draw(this._x, this._y, "", "", "green");
        }
        
        // constructor for object weapon
        let Weapon = function(x, y){
            this._x = x;
            this._y = y;
            this._draw;
        }
        
        // In the prototype so valid for every newly created weapon.
        Weapon.prototype._draw = function(){
            // Draw the symbol with color yellow to position x and y.
            that.state.Game.display.draw(this._x, this._y, "", "", "yellow");
        }
        
        // constructor for object health
        let Doorway = function(x, y){
            this._x = x;
            this._y = y;
            this._draw;
        }
        
        // In the prototype so valid for every newly created health object.
        Doorway.prototype._draw = function(){
            // Draw the symbol with color green to position x and y.
            that.state.Game.display.draw(this._x, this._y, "", "", "BlueViolet");
        }

        return ({
                //the display is the space upon which the digger draws the map
                display: null,
                map: {},
                player: null,
                enemies: {},
                finalEnemy: null,
                health: {},
                weapons: {},
                doorway: null,
                engine: null,
                schedulerRef: null,
                numberOfEnemiesPerChamber: 15,
                numberOfHealthsPerChamber: 3,
                fieldOfView: null,
                init: function(){
                    this.display = new ROT.Display({width:120, height:50, fontSize:16, bg: "#24281e"});

                    // This works around the usual way of rendering components in React. Unfortunately getContainer() returns
                    // an object, which is not renderable with react. While its not perfect, it should not be too much of a problem
                    // because there is no fast rerendering involved.
                    
                    document.getElementById("root").childNodes[0].appendChild(this.display.getContainer());
                    
                    
                    this._generateMap();                    
                    
                    let scheduler = new ROT.Scheduler.Simple();
                    this.schedulerRef = scheduler;
                    scheduler.add(this.player, true);
                    if(finalDungeon === true){
                        scheduler.add(this.finalEnemy, true);
                    }
                    this.engine = new ROT.Engine(scheduler);
                    this.engine.start();
                },
                _generateMap: function(){
                    
                    let that = this;
                    
                    // Object which is responsible to digg the actual map.
                    let digger = new ROT.Map.Digger(120, 50, {roomWidth: [5, 15], roomHeight: [5, 15], corridorLength: [1, 4], dugPercentage: 0.2});
                    let freeCells = [];
                    
                    
                    // apart from building the actual dungeon on the canvas, the digger shall save all the coordinates of freecells for other usage
                    let digCallback = function(x, y, value){
                        if(value) {return}; // do not store walls
                        let key = x + "," + y;
                        
                        // Free cells are those, that the user can walk upon, i.e. no wall.
                        freeCells.push(key);
                        
                        // Free cells are filled with the icon given here.
                        this.map[key] = "";
                    }
                    
                    // creates the actual map, with the dungeon algorithm. For every point a separate array with the 
                    // freecells is created in the callback and this.map is filled with the freecells.
                    digger.create(digCallback.bind(this));
                    
                    // draws the map without a limited field of view
                    //this._drawWholeMap(freeCells);
                    
                    
                    //this generates Boxes and later randomly spreads enemies across the field of freecells
                    this._generateEnemies(freeCells);
                    
                    //
                    if(finalDungeon === true){
                        this._generateFinalEnemy(freeCells);
                    } else {
                        this._generateDoorway(freeCells);
                    }
                    
                    //this generates Health exactly like boxes / enemies
                    this._generateHealth(freeCells);
                    
                    //this generates Health exactly like weapons
                    this._generateWeapons(freeCells);
                    
                    
                    // ... and the player, which draws itself in its draw function in its constructor
                    this.player = this._createBeing(Player, freeCells);
 
                    // draws the map with a limited field of view
                    let lightPasses = function(x, y){
                        let key = x + "," + y;
                        return key in that.map;
                    }
                    
                    let fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
                    this.fieldOfView = fov;

                    fov.compute(that.player._x, that.player._y, 6, function(x, y, r, visibility) {
                        let key = x + "," + y;
                        that.display.draw(x, y, "", "", key in that.map ? "lightgrey": "#24281e");
                    });
                    this.player._draw();
                    
                },
                _generateEnemies: function(freeCells){
                    for (let i = 0; i < this.numberOfEnemiesPerChamber; i++){
                        let enemyObject = this._createBeing(Enemy, freeCells);
                        this.enemies[enemyObject._x + "," + enemyObject._y] = enemyObject;
                        this.map[enemyObject._x + "," + enemyObject._y] = "enemy";
                    }
                },
                _generateFinalEnemy: function(freeCells){
                    this.finalEnemy = this._createBeing(FinalEnemy, freeCells);
                    this.map[this.finalEnemy._x + "," + this.finalEnemy._y] = "finalEnemy";
                },
                _generateHealth: function(freeCells){
                    for (let i = 0; i < this.numberOfHealthsPerChamber; i++){
                        
                        let healthObject = this._createBeing(Health, freeCells);
                        
                        this.health[healthObject._x + "," + healthObject._y] = healthObject;
                        this.map[healthObject._x + "," + healthObject._y] = "health";

                    }
                },
                _generateWeapons: function(freeCells){
                    for (let i = 0; i < 2; i++){
                        
                        let weaponObject = this._createBeing(Weapon, freeCells);
                        
                        this.weapons[weaponObject._x + "," + weaponObject._y] = weaponObject;
                        this.map[weaponObject._x + "," + weaponObject._y] = "weapon";

                    }
                },
                _generateDoorway: function(freeCells){

                    let doorwayObject = this._createBeing(Doorway, freeCells);
                        
                    this.doorway = doorwayObject;
                    this.map[doorwayObject._x + "," + doorwayObject._y] = "doorway";

                },
                _drawWholeMap: function(freeCells) {

                    for (let key in this.map) {
                        let parts = key.split(",");
                        let x = parseInt(parts[0], 10);
                        let y = parseInt(parts[1], 10);

                        // draws all the points, using the map
                        this.display.draw(x, y, "", "", "lightgrey"); 
                    }
     
                },
                _createBeing: function(what, freeCells){
                    
                    // places the player at a random point at the start
                    let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
                    let key = freeCells[index];
                    let parts = key.split(",");
                    let x = parseInt(parts[0], 10);
                    let y = parseInt(parts[1], 10);

                    return new what(x, y);
                    
                    
                }
            }
        );   
    }
  
    render(){
        return null;
    }
}

class Game extends React.Component{
    
    constructor(props){
        super(props);
        
        this.state = {
                playerHealth: 40,
                weapons: ["Knife", "Baseball Bat", "Colt", "P90", "MG5", "AK47", "Flamethrower", "Bazooka", "Energy Weapon"],
                currentWeapon: 0,
                dungeon: 1,
                playerPoints: 0,
                referenceGameObj: this
        }
    }

    
    handlePlayerFight(objectToFight, referenceGameObj){
        return new Promise(function(res, rej){
            
            if(objectToFight === "enemy"){
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth - 5)
                }), () => res(objectToFight));
            } else if (objectToFight === "finalEnemy"){
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth - 40)
                }), () => res(objectToFight));
            } else if(objectToFight === "weapon"){
                if(referenceGameObj.state.currentWeapon < referenceGameObj.state.weapons.length){
                    referenceGameObj.setState((prevState) => ({
                        currentWeapon: prevState.currentWeapon + 1
                    }), () => res(objectToFight));
                }
            } else if(objectToFight === "finalEnemy"){
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth - 20)
                }), () => res(objectToFight));
            } else if(objectToFight === "health"){
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth + 30)
                }), () => res(objectToFight));
            } 
            
        });
        
    }
    
    jumpToNewDungeon(referenceGameObj){
        
        if(referenceGameObj.state.dungeon >= 3) return;
        
        referenceGameObj.setState((prevState) => ({
            dungeon: (prevState.dungeon + 1)
        }), () => console.log(referenceGameObj.state.dungeon));
    }
    
    handlePlayerPointsUp(referenceGameObj){
        referenceGameObj.setState((prevState) => ({
            playerPoints: prevState.playerPoints + 1
        }));
    }
    
    
    render(){
        if(ROT.isSupported()){
            return(
                    <div className="completeGameWrapper" id="completeGameWrapperId">
                        <Stats key="theStats" 
                               ref="theRefStats" 
                               currentWeapon={this.state.weapons[this.state.currentWeapon]} 
                               playerHealth={this.state.playerHealth} 
                               dungeon={this.state.dungeon}
                               playerPoints={this.state.playerPoints}/>
                        <Map key="theActualGame" 
                             ref="theRefActualGame" 
                             currentWeapon={this.state.weapons[this.state.currentWeapon]} 
                             referenceGameObject={this.state.referenceGameObj} 
                             playerHealth={this.state.playerHealth} 
                             onPlayerFight={this.handlePlayerFight} 
                             dungeon={this.state.dungeon}
                             onNewDungeon={this.jumpToNewDungeon}
                             playerPoints={this.state.playerPoints}
                             handlePlayerPointsUp={this.handlePlayerPointsUp}/>
                    </div>
            );
        }
        else{
            return(
                    <div>I am sorry, but the library which was used to build this game (rot.js), is not supported by your browser.</div>
            );
        }   
          
    };
    
}


ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
