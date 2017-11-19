import React from 'react';
import ROT from "rot-js";
import Stats from './stats.jsx';
import Map from './map.jsx';

/** 
 * Game Component for the roguelike chambergame.
 * The game component is a wrapper for whole game, i.e. the stats of the game and the map itself.
 * and the map, which contains the actual map and its components, i.e. boxes.
 * 
 * There are some properties of the game, which act on the logic of the game, i.e. the gameObject itself,
 * but also change properties on the stats component. The Game Component glues them together. The gameObject
 * registers such changes, calls handler functions on the Game Component layer, which passes them back down to the stats component.
 * 
 * Author: Nikolai Riedel
 * Credits: @Ondrej Zara for creating rot.js and @fb for creating react.js
*/

export default class Game extends React.Component{
    
    /**
     *  Constructor for the game component. Contains all the properties of the game, which are important for the stats as well as for gameplay.
     * @constructor
     */
    constructor(){
        super();
           
        this.state = {
                playerHealth: 100,
                weapons: ["Knife", "Baseball Bat", "Colt", "P90", "MG5", "AK47", "Flamethrower", "Bazooka", "Energy Weapon"],
                weaponsDamage: [5, 10, 15, 20, 25, 30, 35, 40, 50],
                currentWeapon: 0,
                playerLevel: 1,
                currentAttack: 2.5,
                dungeon: 1,
                playerPoints: 0,
                playerFinalPoints: 0,
                currentTime: 0,
                stopGame: false,
                referenceGameComp: this,
                gameWrapperStyling: "completeGameWrapper",
                gameRestarted: false,
                popupContent: null
        }
    }
    
    /**
     * Fires when the game component is first mounted and starts the time. 
     */
    componentWillMount(){
        this.setCurrentTime();
    }

    /** This function handles all interactions between the player and boxes, i.e. enemies, weapons, life etc.
     * @params {string} objectToFight - A string description of the object which is to be fought.
     * @params {reference} referenceGameObj - This function is given to the child component map as a prop. It is called from there. A such,
     * inside this function there is no reference to the actual game component/object on which it is operating. Hence the reference is passed down as a prop from the game
     * component to the map component, and then passed into this function.
     */
    handlePlayerFight(objectToFight, referenceGameObj){
        return new Promise(function(res, rej){
            let damage;
            if(objectToFight === "enemy"){
                if(referenceGameObj.state.dungeon === 1){
                    damage = Math.floor(ROT.RNG.getUniform() * 5) + 3;
                    referenceGameObj.setState((prevState) => ({
                        playerHealth: (prevState.playerHealth - damage)
                    }), () => res(objectToFight));
                    referenceGameObj.handlePlayerPointsUp(referenceGameObj, damage);
                } else if (referenceGameObj.state.dungeon === 2){
                    damage = Math.floor(ROT.RNG.getUniform() * 5) + 8;
                    referenceGameObj.setState((prevState) => ({
                        playerHealth: (prevState.playerHealth - damage)
                    }), () => res(objectToFight));
                    referenceGameObj.handlePlayerPointsUp(referenceGameObj, damage);
                } else if (referenceGameObj.state.dungeon === 3){
                    damage = Math.floor(ROT.RNG.getUniform() * 5) + 13;
                    referenceGameObj.setState((prevState) => ({
                        playerHealth: (prevState.playerHealth - damage)
                    }), () => res(objectToFight));
                    referenceGameObj.handlePlayerPointsUp(referenceGameObj, damage);
                }
            } else if (objectToFight === "finalEnemy"){
                damage = Math.floor(ROT.RNG.getUniform() * 5) + 20;
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth - damage)
                }), () => res(objectToFight));
                referenceGameObj.handlePlayerPointsUp(referenceGameObj, damage);
            } else if(objectToFight === "weapon"){
                if(referenceGameObj.state.currentWeapon < referenceGameObj.state.weapons.length){
                    referenceGameObj.setState((prevState) => ({
                        currentWeapon: prevState.currentWeapon + 1,
                        currentAttack: prevState.weaponsDamage[prevState.currentWeapon + 1] * prevState.playerLevel * 0.5
                    }), () => res(objectToFight));
                    referenceGameObj.handlePlayerPointsUp(referenceGameObj, 5);
                }
            } else if(objectToFight === "health"){
                referenceGameObj.setState((prevState) => ({
                    playerHealth: (prevState.playerHealth + 30)
                }), () => res(objectToFight));
                referenceGameObj.handlePlayerPointsUp(referenceGameObj, 5);
            } 
            
        });
        
    }
    /** 
     * Handles the jump to a new dungeon on the layer of the game component. 
     * Does not do anything if the game tries to jump to a level/dungeon 2.
     * @param object referenceGameObj - Needs a reference to the object it is operationg on: The GameObject.
     */
    jumpToNewDungeon(referenceGameObj){
        
        if(referenceGameObj.state.dungeon >= 3) return;
        
        referenceGameObj.setState((prevState) => ({
            dungeon: (prevState.dungeon + 1)
        }));
    }
    
    /**
     * Handles increase of player points on the layer of the game component.
     * @param object referenceGameObj - Reference to the game object.  
     * @param number up - The number of points the player gained.
     */
    handlePlayerPointsUp(referenceGameObj, up){
        referenceGameObj.setState((prevState) => ({
            playerPoints: prevState.playerPoints + up
        }), () => referenceGameObj.state.playerPoints - (referenceGameObj.state.playerLevel * 50) > 0 ? this.handlePlayerLevelUp(referenceGameObj) : 0);
    }
    
    /**
     * Handles increase of player level / dungeon on the layer of the game component.
     * @param object referenceGameObj - Reference to the game object. 
     */
    handlePlayerLevelUp(referenceGameObj){
        referenceGameObj.setState(prevState => ({
            playerLevel: prevState.playerLevel + 1,
            currentAttack: prevState.weaponsDamage[prevState.currentWeapon] * (prevState.playerLevel + 1) * 0.5
        }));
    }
    
    /**
     * Handles the kill of the final enemy on the layer of the game component.
     * @param object referenceGameObj - Reference to the game object.
     */
    handleFinalEnemyKilled(referenceGameObj){
        referenceGameObj.setState({
            popupContent: "Congratulations, you have killed the final enemy! \n Your final score is: " + referenceGameObj.state.playerFinalPoints + ". \n Go faster next time, to get an even higher score!"
        }, () => referenceGameObj.showPopup());
    }
    
    /**
     * During gameplay there is a time running. This function sets this time and stops it upon an ended game. 
     * Its a recursive implementation firing every (at least) 1000 ms.
     */
    setCurrentTime(){
        
        if(this.state.currentTime > 0){
            this.setState({
                playerFinalPoints: Math.floor(parseInt(this.state.playerPoints, 10) / (parseInt(this.state.currentTime, 10) / 3))
            });
        }
 
        if(this.state.playerHealth <= 0 && this.state.gameRestarted === false) {
            return;
        }
        
        if (this.state.stopGame === true) {
            return;
        }
        
        else{
            this.setState({
                currentTime: this.state.currentTime + 1
            }, () => setTimeout(() => this.setCurrentTime(), 1000));
        }
    }

    /**
     * Handles the players health dropping below 0, on the layer of the game component.
     * @param object referenceGameComp - This function is called from the player object, and needs a reference back to the react game component, to set states on it. 
     */
    handlePlayerKilled(referenceGameComp){
        referenceGameComp.setState({
            popupContent: "You have lost my friend! :-("
        }, () => referenceGameComp.showPopup());
    }
    
    /**
     * Handles a click on the Stop Game Button at the top of the map. Shows a popup to restart the game.
     * Calls the corresponding stopGame function on the map/game object, i.e. the actual game, which then resets
     * all the properties on the layer of the game object. 
     */
    stopGame(){
        this.showPopup();
        this.setState({
            stopGame: true
        }, this.setState({
            stopGame: false,
            referenceGameObj: null
            }, () => this.refs.theRefActualGame.stopGame(this.refs.theRefActualGame)));
    }
    
    /**
     * Just shows a popup whenever the game ends for any reason.
     */
    showPopup(){
        this.refs.endOfGamePop.classList.toggle("show");
    }
    
    /**
     * Restarts the game, such that it is in the same state as when the page is first loaded.
     */
    restartThisGame(){
        this.showPopup();
        this.setState({
            playerHealth: 100,
            currentWeapon: 0,
            dungeon: 1,
            playerPoints: 0,
            playerFinalPoints: 0,
            currentTime: 0,
            stopGame: true,
            gameWrapperStyling: "completeGameWrapper",
            gameRestarted: true,
            popupContent: null,
            currentAttack: 2.5
        }, () => this.setState({
                gameRestarted: false,
                stopGame: false
            }, () => this.setCurrentTime()));

        this.refs.theRefActualGame._reloadMap();    
  
    };
    
    /**
     * When the player fights with an enemy (red box), the whole game shakes.
     * @param object referenceGameObj - Reference to the game object. 
     */
    handleGameWrapperStylingChange(referenceGameObj){

        referenceGameObj.setState({
            gameWrapperStyling: "completeGameWrapper completeGameWrapperAnimation"
        }, () => setTimeout(() => referenceGameObj.setState({
            gameWrapperStyling: "completeGameWrapper"
        }), 100)); 
        
    }
    
    /**
     * Renders the component.
     */
    render(){
        if(ROT.isSupported()){
            return(
                    <div className={this.state.gameWrapperStyling} id="completeGameWrapperId" ref="compGameWrapper">
                        <div id="headLine">Roguelike Chamber Game using React</div>
                        <span><Stats key="theStats" 
                               ref="theRefStats"
                               weapons={this.state.weapons}
                               currentWeapon={this.state.currentWeapon} 
                               playerHealth={this.state.playerHealth} 
                               dungeon={this.state.dungeon}
                               playerPoints={this.state.playerPoints}
                               currentTime={this.state.currentTime}
                               playerFinalPoints={this.state.playerFinalPoints}
                               gameRestarted={this.state.gameRestarted}
                               weaponsDamage={this.state.weaponsDamage}
                               playerLevel={this.state.playerLevel}
                               currentAttack={this.state.currentAttack}/>
                        <button style={{width: "100%"}} onClick={this.stopGame.bind(this)}>Stop Game</button></span>
                        <Map key="theActualGame" 
                             ref="theRefActualGame" 
                             currentWeapon={this.state.weapons[this.state.currentWeapon]} 
                             referenceGameComponent={this.state.referenceGameComp} 
                             playerHealth={this.state.playerHealth} 
                             onPlayerFight={this.handlePlayerFight} 
                             dungeon={this.state.dungeon}
                             onNewDungeon={this.jumpToNewDungeon}
                             onGameWrapperStylingChange={this.handleGameWrapperStylingChange}
                             onFinalEnemyKilled={this.handleFinalEnemyKilled}
                             onPlayerKilled={this.handlePlayerKilled}
                             playerPoints={this.state.playerPoints}
                             gameRestarted={this.state.gameRestarted}
                             weaponsDamage={this.state.weaponsDamage}
                             playerLevel={this.state.playerLevel}
                             currentAttack={this.state.currentAttack}/>
                       
                       <div className="popup">
                           <p className="popuptext" ref="endOfGamePop"><span>{this.state.popupContent}</span><br /><button onClick={this.restartThisGame.bind(this)}>Restart Game</button></p>
                       </div>
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