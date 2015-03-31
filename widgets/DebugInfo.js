/**
 * # DebugInfo
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = node.window.Table,
    GameStage = node.GameStage;

    node.widgets.register('DebugInfo', DebugInfo);

    // ## Meta-data

    DebugInfo.version = '0.5.0';
    DebugInfo.description = 'Display basic info about player\'s status.';

    DebugInfo.title = 'State Display';
    DebugInfo.className = 'statedisplay';

    // ## Dependencies

    DebugInfo.dependencies = {
        Table: {}
    };


    /**
     * ## DebugInfo constructor
     *
     * `DebugInfo` displays information about the state of a player
     */
    function DebugInfo() {
        /**
         * ### DebugInfo.table
         *
         * The `Table` which holds the information
         *
         * @See nodegame-window/Table
         */
        this.table = new Table();
    }

    // ## DebugInfo methods

    /**
     * ### DebugInfo.append
     *
     * Appends widget to `this.bodyDiv` and calls `this.updateAll`
     *
     * @see DebugInfo.updateAll
     */
    DebugInfo.prototype.append = function() {
        var that, checkPlayerName;
        that = this;
        checkPlayerName = setInterval(function() {
            if (node.player && node.player.id) {
                clearInterval(checkPlayerName);
                that.updateAll();
            }
        }, 100);
        this.bodyDiv.appendChild(this.table.table);
    };

    /**
     * ### DebugInfo.updateAll
     *
     * Updates information in `this.table`
     */
    DebugInfo.prototype.updateAll = function() {
        var stage, stageNo, stageId, playerId, tmp, miss;
        miss = '-';

        stageId = miss;
        stageNo = miss;
        playerId = miss;

        if (node.player.id) {
            playerId = node.player.id;
        }

        stage = node.game.getCurrentGameStage();
        if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

        this.table.clear(true);
        this.table.addRow(['Stage  No: ', stageNo]);
        this.table.addRow(['Stage  Id: ', stageId]);
        this.table.addRow(['Player Id: ', playerId]);
        this.table.parse();

    };

    DebugInfo.prototype.listeners = function() {
        var that = this;
        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateAll();
        });
    };

    DebugInfo.prototype.destroy = function() {
        node.off('STEP_CALLBACK_EXECUTED', DebugInfo.prototype.updateAll);
    };

})(node);
