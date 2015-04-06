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

    var J = node.JSUS;

    var Table = node.window.Table,
    GameStage = node.GameStage;

    node.widgets.register('DebugInfo', DebugInfo);

    // ## Meta-data

    DebugInfo.version = '0.6.0';
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
        var stage, stageNo, stageId, playerId;
        var stageLevel, stateLevel, winLevel;
        var errMsg, connected;
        var tmp, miss;

        miss = '-';

        stageId = miss;
        stageNo = miss;
        playerId = miss;

        stage = node.game.getCurrentGameStage();
        if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

        stageLevel = J.getKeyByValue(node.constants.stageLevels,
                                     node.game.getStageLevel())

        stateLevel = J.getKeyByValue(node.constants.stateLevels,
                                     node.game.getStateLevel())

        winLevel = J.getKeyByValue(node.constants.windowLevels,
                                   W.getStateLevel())


        errMsg = node.errorManager.lastErr || miss;

        connected = node.socket.connected ? 'yes' : 'no';

        this.table.clear(true);
        this.table.addRow(['Connected: ', connected]);
        this.table.addRow(['Player Id: ', node.player.id]);
        this.table.addRow(['Stage  No: ', stageNo]);
        this.table.addRow(['Stage  Id: ', stageId]);
        this.table.addRow(['Stage Lvl: ', stageLevel]);
        this.table.addRow(['State Lvl: ', stateLevel]);
        this.table.addRow(['Win   Lvl: ', winLevel]);
        this.table.addRow(['Win Loads: ', W.areLoading]);
        this.table.addRow(['Last  Err: ', errMsg]);

        this.table.parse();

    };

    DebugInfo.prototype.listeners = function() {
        var that, ee;

        that = this;

        // Should get the game ?

        ee = node.getCurrentEventEmitter();

        ee.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateAll();
        });

        ee.on('SOCKET_CONNECT', function() {
            that.updateAll();
        });

        ee.on('SOCKET_DICONNECT', function() {
            that.updateAll();
        });

        // TODO Write more listeners. Separate functions. Get event emitter.

    };

    DebugInfo.prototype.destroy = function() {
        node.off('STEP_CALLBACK_EXECUTED', DebugInfo.prototype.updateAll);
        // TODO proper cleanup.

    };

})(node);
