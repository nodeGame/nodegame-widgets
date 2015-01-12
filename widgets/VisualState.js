/**
 * # VisualStage
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next state.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS;
    var Table = node.window.Table;

    node.widgets.register('VisualStage', VisualStage);

    // ## Meta-data

    VisualStage.version = '0.2.2';
    VisualStage.description =
        'Visually display current, previous and next state of the game.';

    VisualStage.title = 'State';
    VisualStage.className = 'visualstage';

    // ## Dependencies

    VisualStage.dependencies = {
        JSUS: {},
        Table: {}
    };

    /**
     * ## VisualStage constructor
     *
     * `VisualStage` displays current, previous and next state of the game
     */
    function VisualStage() {
        this.table = new Table();
    }

    /**
     * ## VisualStage.append
     *
     * Appends widget to `this.bodyDiv` and writes the state
     *
     * @see VisualStage.writeState
     */
    VisualStage.prototype.append = function() {
        this.bodyDiv.appendChild(this.table.table);
        this.writeState();
    };

    VisualStage.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.writeState();
        });
        // Game over and init?
    };

    /**
     * ## VisualStage.writeState
     *
     * Writes the current, previous and next state into `this.table`
     */
    VisualStage.prototype.writeState = function() {
        var miss, state, pr, nx, tmp;
        var curStep, nextStep, prevStep;
        var t;

        miss = '-';
        state = 'Uninitialized';
        pr = miss;
        nx = miss;

        curStep = node.game.getCurrentGameStage();

        if (curStep) {
            tmp = node.game.plot.getStep(curStep);
            state = tmp ? tmp.id : miss;

            prevStep = node.game.plot.previous(curStep);
            if (prevStep) {
                tmp = node.game.plot.getStep(prevStep);
                pr = tmp ? tmp.id : miss;
            }

            nextStep = node.game.plot.next(curStep);
            if (nextStep) {
                tmp = node.game.plot.getStep(nextStep);
                nx = tmp ? tmp.id : miss;
            }
        }

        this.table.clear(true);

        this.table.addRow(['Previous: ', pr]);
        this.table.addRow(['Current: ', state]);
        this.table.addRow(['Next: ', nx]);

        t = this.table.selexec('y', '=', 0);
        t.addClass('strong');
        t.selexec('x', '=', 2).addClass('underline');
        this.table.parse();
    };

})(node);
