import React from 'react';
import ROT from "rot-js";
import GameObject from './gameObject';

/** 
 * The actual game field.
 * Author: Nikolai Riedel
 * Credits: @Ondrej Zara for creating rot.js and @fb for creating react.js
*/

export default class Map extends React.Component{

    /**
     * Constructor for the map.
     * @constructor
     * @param object props - The props passed by the game component, which are needed for the game object, the logic behind the game. 
     */
    constructor(props){
        super(props);

        this.state = {
                Game: {},
                playerHealth: null,
                referenceGameComponent: null,
                dungeon: null,
                currentAttack: null
        }
      
    }
    
    /**
     * Fires when the component mounts, i.e. it receives props for the first time.
     */
    componentWillMount(){

        ROT.RNG.setSeed(Date.now());
        
        //On mounting the object holding the game and its players is created. Afterwards its initialization function handels the game start.
        this.setState({
            playerHealth: this.props.playerHealth,
            referenceGameComponent: this.props.referenceGameComponent,
            dungeon: this.props.dungeon,
            currentAttack: this.props.currentAttack,
            Game : this.createGameObject(false) // the boolean indicates, that this is not the final dungeon, i.e. no final enemy shall be created
        }, () => this.state.Game.init());
    }
    
    /**
     * When props change on the layer of the game component, they are received on the map component, and set in this function.
     * @param object nextState  
     */
    componentWillReceiveProps(nextState){
        this.setState({
            playerHealth: nextState.playerHealth,
            referenceGameComponent: this.props.referenceGameComponent,
            dungeon: nextState.dungeon,
            currentAttack: nextState.currentAttack,
        });
    }
    
    /**
     * This function fires, when the map is reloaded.
     */
    _reloadMap(){
        console.log(this.state.dungeon);
        // no final enemy in the first two dungeons
        if(this.state.dungeon <= 2){
            document.getElementById("completeGameWrapperId").removeChild(document.getElementById("completeGameWrapperId").childNodes[4]);
            this.setState({
                Game: this.createGameObject(false)
            }, () => this.state.Game.init());
                        
        } else if(this.state.dungeon === 3){
            document.getElementById("completeGameWrapperId").removeChild(document.getElementById("completeGameWrapperId").childNodes[4]);
            this.setState({
                Game: this.createGameObject(true)
            }, () => this.state.Game.init());
        }
        
    }
    
    /**
     * This function fires, when the game is stopped.
     * The game can be stopped from the game component layer, and also 
     * changes properties on this layer. This is, why it needs a
     * reference to the MAP component, especially when it is called
     * from a different layer.
     * @param object thisRef 
     */
    stopGame(thisRef){
        return new Promise(function(resolve, reject){
            thisRef.state.Game.engine.unlock();
            window.removeEventListener("keydown", thisRef.state.Game.player);
            thisRef.setState({
                Game: {},
                playerHealth: null,
                referenceGameComponent: null,
                dungeon: null,
                currentAttack: null
            }, () => resolve("done"));
        });
    }
   
    /**
     * Function which creates the actual game object.
     * @param boolean finalDungeon - Boolean to decide if the player is in the final dungeon and hence if a final enemy shall be created. 
     */
    createGameObject(finalDungeon){
        let that = this;
        return (new GameObject(that, finalDungeon));   
    }
    
    /**
     * Nothing is rendered here, because the game object is drawn to the screen using a canvas.
     */
    render(){
        return null;
    }
}