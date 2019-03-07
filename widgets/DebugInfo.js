/**
 * # DebugInfo
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('DebugInfo', DebugInfo);

    // ## Meta-data

    DebugInfo.version = '0.6.2';
    DebugInfo.description = 'Display basic info a client\'s status.';

    DebugInfo.title = 'Debug Info';
    DebugInfo.className = 'debuginfo';

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
        this.table = null;

        /**
         * ### DebugInfo.interval
         *
         * The interval checking node properties
         */
        this.interval = null;

        /**
         * ### DebugInfo.intervalTime
         *
         * The frequency of update of the interval. Default: 1000
         */
        this.intervalTime = 1000;
    }

    // ## DebugInfo methods

    /**
     * ### DebugInfo.init
     *
     * Appends widget to `this.bodyDiv` and calls `this.updateAll`
     *
     * @see DebugInfo.updateAll
     */
    DebugInfo.prototype.init = function(options) {
        var that;
        if ('number' === typeof options.intervalTime) {
            this.intervalTime = options.intervalTime;
        }

        that = this;
        this.on('destroyed', function() {
            clearInterval(that.interval);
            that.interval = null;
            node.silly('DebugInfo destroyed.');
        });
    };

    /**
     * ### DebugInfo.append
     *
     * Appends widget to `this.bodyDiv` and calls `this.updateAll`
     *
     * @see DebugInfo.updateAll
     */
    DebugInfo.prototype.append = function() {
        var that;

        this.table = new Table();
        this.bodyDiv.appendChild(this.table.table);

        this.updateAll();
        that = this;
        this.interval = setInterval(function() {
            that.updateAll();
        }, this.intervalTime);
    };

    /**
     * ### DebugInfo.updateAll
     *
     * Updates information in `this.table`
     */
    DebugInfo.prototype.updateAll = function() {
        var stage, stageNo, stageId, playerId;
        var stageLevel, stateLevel, winLevel;
        var errMsg, connected, treatment;
        var tmp, miss;

        if (!this.bodyDiv) {
            node.err('DebugInfo.updateAll: bodyDiv not found.');
            return;
        }

        miss = '-';

        stageId = miss;
        stageNo = miss;

        stage = node.game.getCurrentGameStage();
        if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

        stageLevel = J.getKeyByValue(node.constants.stageLevels,
                                     node.game.getStageLevel());

        stateLevel = J.getKeyByValue(node.constants.stateLevels,
                                     node.game.getStateLevel());

        winLevel = J.getKeyByValue(node.constants.windowLevels,
                                   W.getStateLevel());


        playerId = node.player ? node.player.id : miss;

        errMsg = node.errorManager.lastErr || miss;

        treatment = node.game.settings && node.game.settings.treatmentName ?
            node.game.settings.treatmentName : miss;

        connected = node.socket.connected ? 'yes' : 'no';

        this.table.clear(true);
        this.table.addRow(['Treatment: ', treatment]);
        this.table.addRow(['Connected: ', connected]);
        this.table.addRow(['Player Id: ', playerId]);
        this.table.addRow(['Stage  No: ', stageNo]);
        this.table.addRow(['Stage  Id: ', stageId]);
        this.table.addRow(['Stage Lvl: ', stageLevel]);
        this.table.addRow(['State Lvl: ', stateLevel]);
        this.table.addRow(['Players  : ', node.game.pl.size()]);
        this.table.addRow(['Win   Lvl: ', winLevel]);
        this.table.addRow(['Win Loads: ', W.areLoading]);
        this.table.addRow(['Last  Err: ', errMsg]);

        this.table.parse();

    };

})(node);
