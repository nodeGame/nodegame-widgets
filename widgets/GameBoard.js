/**
 * # GameBoard
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Displays a table of currently connected players
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('GameBoard', GameBoard);

    // ## Meta-data

    GameBoard.version = '0.4.1';
    GameBoard.description = 'Offer a visual representation of the state of ' +
                            'all players in the game.';

    GameBoard.title = 'Game Board';
    GameBoard.className = 'gameboard';

    /**
     * ## GameBoard constructor
     *
     * `GameBoard` shows the currently connected players
     */
    function GameBoard(options) {
        /**
         * ### GameBoard.board
         *
         * The DIV wherein to display the players
         */
        this.board = null;

        /**
         * ### GameBoard.status
         *
         * The DIV wherein to display the status of the game board
         */
        this.status = null;
    }

    // ## GameBoard methods

    /**
     * ### GameBoard.append
     *
     * Appends widget to `this.bodyDiv` and updates the board
     *
     * @see GameBoard.updateBoard
     */
    GameBoard.prototype.append = function() {
        this.status = node.window.addDiv(this.bodyDiv, 'gboard_status');
        this.board = node.window.addDiv(this.bodyDiv, 'gboard');

        this.updateBoard(node.game.pl);
    };

    GameBoard.prototype.listeners = function() {
        var that = this;
        node.on('UPDATED_PLIST', function() {
            that.updateBoard(node.game.pl);
        });
    };

    /**
     * ### GameBoard.updateBoard
     *
     * Updates the information on the game board
     *
     * @see printLine
     */
    GameBoard.prototype.updateBoard = function(pl) {
        var player, separator;
        var that = this;

        this.status.innerHTML = 'Updating...';

        if (pl.size()) {
            that.board.innerHTML = '';
            pl.forEach( function(p) {
                player = printLine(p);

                W.write(player, that.board);

                separator = printSeparator();
                W.write(separator, that.board);
            });
        }
        this.status.innerHTML = 'Connected players: ' + node.game.pl.length;
    };

    // ## Helper methods

     /**
     * ### printLine
     *
     * Returns a `String` describing the player passed in
     *
     * @param {Player} `p`. Player object which will be passed in by a call to
     * `node.game.pl.forEach`.
     *
     * @return {String} A string describing the `Player` `p`.
     *
     * @see GameBoard.updateBoard
     * @see nodegame-client/Player
     */
    function printLine(p) {

        var line, levels, level;
        levels = node.constants.stageLevels;

        line = '[' + (p.name || p.id) + "]> \t";
        line += '(' +  p.stage.round + ') ' + p.stage.stage + '.' +
                p.stage.step;
        line += ' ';

        switch (p.stageLevel) {

        case levels.UNINITIALIZED:
            level = 'uninit.';
            break;

        case levels.INITIALIZING:
            level = 'init...';
            break;

        case levels.INITIALIZING:
            level = 'init!';
            break;

        case levels.LOADING:
            level = 'loading';
            break;

        case levels.LOADED:
            level = 'loaded';
            break;

        case levels.PLAYING:
            level = 'playing';
            break;
        case levels.DONE:
            level = 'done';
            break;

        default:
            level = p.stageLevel;
            break;
        }

        return line + '(' + level + ')';
    }

    function printSeparator() {
        return W.getElement('hr', null, {style: 'color: #CCC;'});
    }

})(node);
