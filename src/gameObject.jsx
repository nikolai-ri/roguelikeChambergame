import ROT from "rot-js";
import Player from './player.jsx';
import Enemy from './enemy.jsx';
import FinalEnemy from './finalEnemy.jsx';
import Health from './health.jsx';
import Weapon from './weapon.jsx';
import Doorway from './doorway.jsx';

export default class GameObject{

    /**
     * Constructor for the gameobject, which contains all the logic of the game. It also creates the canvas, which contains the gamefield/map.
     * @constructor
     * @param object gameReference - Reference to the game object.
     * @param boolean finalDungeon - Boolean to decide if a final enemy shall be created. 
     */
    constructor(gameReference, finalDungeon){
        this.that = gameReference;
        this.display = null;
        this.map = {};
        this.player = null;
        this.enemies = {};
        this.finalEnemy = null;
        this.health = {};
        this.weapons = {};
        this.doorway = null;
        this.engine = null;
        this.schedulerRef = null;
        this.numberOfEnemiesPerChamber = 15;
        this.numberOfHealthsPerChamber = 5;
        this.fieldOfView = null;
        this.finalDungeon = finalDungeon;
    }
    /**
     * Intializes the rot.js objects necessary to run the game.
     */
    init = function(){
        this._clearMap();
        this.display = new ROT.Display({width:120, height:30, fontSize:16, bg: "#24281e"});
        
        // This works around the usual way of rendering components in React. Unfortunately getContainer() returns
        // an object, which is not renderable with react. While its not perfect, it should not be too much of a problem
        // because there is no fast rerendering involved.

        document.getElementById("root").childNodes[0].appendChild(this.display.getContainer());
    
        this._generateMap();                    
        
        let scheduler = new ROT.Scheduler.Simple();
        this.schedulerRef = scheduler;
        scheduler.add(this.player, true);
        if(this.finalDungeon === true){
            scheduler.add(this.finalEnemy, true);
        }
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    }
    /**
     * Generates the map and rot.js objects needed to run the game and create the map.
     * Calls all the functions to create the enemies, the player etc. and renders them to the map.
     */
    _generateMap = function(){
        let gameReference = this.that;
        let displayReference = this;

        // Object which is responsible to digg the actual map.
        let digger = new ROT.Map.Digger(120, 30, {roomWidth: [5, 15], roomHeight: [5, 15], corridorLength: [1, 4], dugPercentage: 0.2});
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
        this._generateEnemies(freeCells, gameReference, displayReference);
        
        //
        if(this.finalDungeon === true){
            this._generateFinalEnemy(freeCells, gameReference, displayReference);
        } else {
            this._generateDoorway(freeCells, gameReference, displayReference);
        }
        
        //this generates Health exactly like boxes / enemies
        this._generateHealth(freeCells, gameReference, displayReference);
        
        //this generates Health exactly like weapons
        this._generateWeapons(freeCells, gameReference, displayReference);
        
        
        // ... and the player, which draws itself in its draw function of its constructor
        this.player = this._createBeing(Player, freeCells, gameReference, displayReference);

        // draws the map with a limited field of view
        let lightPasses = function(x, y){
            let key = x + "," + y;
            return key in displayReference.map;
        }
        
        let fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
        this.fieldOfView = fov;

        fov.compute(displayReference.player._x, displayReference.player._y, 6, function(x, y, r, visibility) {
            let key = x + "," + y;
            displayReference.display.draw(x, y, "", "", key in displayReference.map ? "lightgrey": "#24281e");
        });
        this.player._draw();
        
    }
    /**
     * Resets the map.
     */
    _clearMap = function(){

        Object.keys(this.map).forEach(function(element){
            delete this.map[element];
        });
    }
    /**
     * Generates the enemies on the map.
     */
    _generateEnemies = function(freeCells, gameReference, displayReference){
        for (let i = 0; i < this.numberOfEnemiesPerChamber; i++){
            let enemyObject = this._createBeing(Enemy, freeCells, gameReference, displayReference);
            this.enemies[enemyObject._x + "," + enemyObject._y] = enemyObject;
            this.map[enemyObject._x + "," + enemyObject._y] = "enemy";
        }
    }
    /**
     * Generates the final enemy on the map.
     */
    _generateFinalEnemy = function(freeCells, gameReference, displayReference){
        this.finalEnemy = this._createBeing(FinalEnemy, freeCells, gameReference, displayReference);
        this.map[this.finalEnemy._x + "," + this.finalEnemy._y] = "finalEnemy";
    }
    /**
     * Generates the health boxes on the map.
     */
    _generateHealth = function(freeCells, gameReference, displayReference){
        for (let i = 0; i < this.numberOfHealthsPerChamber; i++){
            
            let healthObject = this._createBeing(Health, freeCells, gameReference, displayReference);
            
            this.health[healthObject._x + "," + healthObject._y] = healthObject;
            this.map[healthObject._x + "," + healthObject._y] = "health";

        }
    }
    /**
     * Generates the weapons boxes on the map.
     */
    _generateWeapons = function(freeCells, gameReference, displayReference){
        for (let i = 0; i < 2; i++){
            
            let weaponObject = this._createBeing(Weapon, freeCells, gameReference, displayReference);
            
            this.weapons[weaponObject._x + "," + weaponObject._y] = weaponObject;
            this.map[weaponObject._x + "," + weaponObject._y] = "weapon";

        }
    }
    /**
     * Generates the doorway on each map but the third.
     */
    _generateDoorway = function(freeCells, gameReference, displayReference){

        let doorwayObject = this._createBeing(Doorway, freeCells, gameReference, displayReference);
            
        this.doorway = doorwayObject;
        this.map[doorwayObject._x + "," + doorwayObject._y] = "doorway";

    }
    /**
     * Draws the map, after everything is created.
     */
    _drawWholeMap = function(freeCells) {

        for (let key in this.map) {
            let parts = key.split(",");
            let x = parseInt(parts[0], 10);
            let y = parseInt(parts[1], 10);

            // draws all the points, using the map
            this.display.draw(x, y, "", "", "lightgrey"); 
        }

    }
    /**
     * Helper function for creating the boxes aka beings.
     * @param object what - Player, Weapon etc. Just put 'Player', 'Weapon' etc. here (without '')
     * @param Array freeCells - array with all the cells currently available for boxes/beings.
     * @param object gameRef - Reference to the gameobject.
     * @param object displayRef - Reference to the displayobject created by rot.js.
     */
    _createBeing = function(what, freeCells, gameRef, displayRef){
        
        // places the player at a random point at the start
        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        let key = freeCells[index];
        let parts = key.split(",");
        let x = parseInt(parts[0], 10);
        let y = parseInt(parts[1], 10);

        return new what(x, y, gameRef, displayRef);

    }
}