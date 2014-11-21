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

    // ## Defaults

    GameSummary.defaults = {};
    GameSummary.defaults.id = 'gamesummary';
    GameSummary.defaults.fieldset = { legend: 'Game Summary' };

    // ## Meta-data

    GameSummary.version = '0.3';
    GameSummary.description =
        'Show the general configuration options of the game.';

    function GameSummary(options) {
        this.summaryDiv = null;
    }

    GameSummary.prototype.append = function(root) {
        this.root = root;
        this.summaryDiv = node.window.addDiv(root);
        this.writeSummary();
        return root;
    };

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

        node.window.addDiv(this.root, this.summaryDiv, idSummary);
    };

})(node);
