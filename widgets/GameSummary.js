/**
 * # GameSummary
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows the configuration options of a game in a box
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('GameSummary', GameSummary);

    // ## Meta-data

    GameSummary.version = '0.3.1';
    GameSummary.description =
        'Show the general configuration options of the game.';

    GameSummary.title = 'Game Summary';
    GameSummary.className = 'gamesummary';


    /**
     * ## GameSummary constructor
     *
     * `GameSummary` shows the configuration options of the game in a box
     */
    function GameSummary() {
        /**
         * ### GameSummary.summaryDiv
         *
         * The DIV in which to display the information
         */
        this.summaryDiv = null;
    }

    // ## GameSummary methods

    /**
     * ### GameSummary.append
     *
     * Appends the widget to `this.bodyDiv` and calls `this.writeSummary`
     *
     * @see GameSummary.writeSummary
     */
    GameSummary.prototype.append = function() {
        this.summaryDiv = node.window.addDiv(this.bodyDiv);
        this.writeSummary();
    };

    /**
     * ### GameSummary.writeSummary
     *
     * Writes a summary of the game configuration into `this.summaryDiv`
     */
    GameSummary.prototype.writeSummary = function(idState, idSummary) {
        var gName = document.createTextNode('Name: ' + node.game.metadata.name),
        gDescr = document.createTextNode(
                'Descr: ' + node.game.metadata.description),
        gMinP = document.createTextNode('Min Pl.: ' + node.game.minPlayers),
        gMaxP = document.createTextNode('Max Pl.: ' + node.game.maxPlayers);

        this.summaryDiv.appendChild(gName);
        this.summaryDiv.appendChild(document.createElement('br'));
        this.summaryDiv.appendChild(gDescr);
        this.summaryDiv.appendChild(document.createElement('br'));
        this.summaryDiv.appendChild(gMinP);
        this.summaryDiv.appendChild(document.createElement('br'));
        this.summaryDiv.appendChild(gMaxP);

        node.window.addDiv(this.bodyDiv, this.summaryDiv, idSummary);
    };

})(node);
