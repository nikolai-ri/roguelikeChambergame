import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './game.jsx';

// implement next:

// time should only start when game is being started actively
// implement end of game
// implement highscore list

/** 
 * Main file for the roguelike chambergame.
 * The game component is a wrapper for whole game, i.e. the stats of the game and the map itself.
 * and the map, which contains the actual map and its components, i.e. boxes.
 * Author: Nikolai Riedel
 * Credits: @Ondrej Zara for creating rot.js and @fb for creating react.js
*/

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
