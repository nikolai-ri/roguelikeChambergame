import React from 'react';
/** 
 * The stats for the game. The values, which are shown on top of the game map.
 * Author: Nikolai Riedel
 * Credits: @Ondrej Zara for creating rot.js and @fb for creating react.js
*/
export default class Stats extends React.Component{
    
    /**
     * Constructor for the Stats, which are shown above the game field.
     * @constructor
     * @param {*} props - All the properties that are shown at the top of the game and those that are needed to construct them and the way they are shown. 
     */
    constructor(props){
        super(props);
        
        this.state = {
                playerHealth: 0,
                weapons: [],
                currentWeapon: 0,
                currentAttack: 0,
                dungeon: 1,
                playerPoints: 0,
                currentTime: 0,
                playerFinalPoints: 0,
                playerHealthStyle: {},
                headLineStyle: {},
                gameRestarted: false,
                weaponsDamage: [],
                playerLevel: 1
        };
    }
    
    /**
     * Each time the component is mounted, these will be set.
     */
    componentWillMount(){
        this.setState({
            playerHealth: this.props.playerHealth,
            weapons: this.props.weapons,
            currentWeapon: this.props.currentWeapon,
            dungeon: this.props.dungeon,
            playerPoints: this.props.playerPoints,
            currentTime: this.props.currentTime,
            playerFinalPoints: this.props.playerFinalPoints,
            playerHealthStyle: {
                color: "green"
            },
            headLineStyle: {
                fontSize: "1.5rem",
                display: "block",
                textAlign: "center"
            },
            gameRestarted: this.props.gameRestarted,
            weaponsDamage: this.props.weaponsDamage,
            currentAttack: this.props.currentAttack,
            playerLevel: this.props.playerLevel
        });
    }
    
    /**
     * When the stats change, due to the game flow, the stats component receives new stats and this function will fire.
     * @param {*} nextState - When the component receives new props, they are saved into the nextState object. 
     */
    componentWillReceiveProps(nextState){   
        this.setState({
            playerHealth: nextState.playerHealth,
            currentWeapon: nextState.currentWeapon,
            currentAttack: nextState.currentAttack,
            dungeon: nextState.dungeon,
            playerPoints: nextState.playerPoints,
            currentTime: nextState.currentTime,
            playerFinalPoints: nextState.playerFinalPoints,
            gameRestarted: nextState.gameRestarted
        }, () => this.resetGame());
        
        this.setPlayerHealthColor();
    }
    
    /**
     * Handles all the necessary changes on the stats layer, when the game is reset.
     */
    resetGame(){
        if(this.state.gameRestarted === true){
            this.setState({
                playerHealthStyle: {color:"green"},
                gameRestarted: false
            });
        }
    }
    
    /**
     * Depending on the health left to the player, the appearence of the health stats change. This function handles this behaviour.
     */
    setPlayerHealthColor(){
        if(this.state.playerHealth > 66){
            this.setState({
                playerHealthStyle: {
                    color: "green"
                }
            });
        } else if (this.state.playerHealth > 33){
            this.setState({
                playerHealthStyle: {
                    color: "yellow",
                    backgroundColor: "black"
                        
                }
            });
        } else {
            this.setState({
                playerHealthStyle: {
                    color: "red",
                    backgroundColor: "black"
                }
            });
        }
    }
    
    /**
     * Renders the stats at the top of the game field.
     */
    render(){
        
        return(
                <div><span style={this.state.headLineStyle}>{"XP: " + this.state.playerPoints + " | Health: "}<span style={this.state.playerHealthStyle}>{this.state.playerHealth}</span>{" | Weapon: " + this.state.weapons[this.state.currentWeapon] + " | Attack: " + this.state.currentAttack + " | Dungeon: " + this.state.dungeon + " | Time: " + this.state.currentTime + " | Time normalized score: " + this.state.playerFinalPoints}</span></div>
        );
    }
}