/**
 * # VisualStage
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next stage.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = node.window.Table;

    node.widgets.register('VisualStage', VisualStage);

    // ## Meta-data

    VisualStage.version = '0.2.2';
    VisualStage.description =
        'Visually display current, previous and next stage of the game.';

    VisualStage.title = 'Stage';
    VisualStage.className = 'visualstage';

    // ## Dependencies

    VisualStage.dependencies = {
        JSUS: {},
        Table: {}
    };

    /**
     * ## VisualStage constructor
     *
     * `VisualStage` displays current, previous and next stage of the game
     */
    function VisualStage() {
        this.table = new Table();
    }

    // ## VisualStage methods

    /**
     * ### VisualStage.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see VisualStage.writeStage
     */
    VisualStage.prototype.append = function() {
        this.bodyDiv.appendChild(this.table.table);
        this.writeStage();
    };

    VisualStage.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.writeStage();
        });
        // Game over and init?
    };

    /**
     * ### VisualStage.writeStage
     *
     * Writes the current, previous and next stage into `this.table`
     */
    VisualStage.prototype.writeStage = function() {
        var miss, stage, pr, nx, tmp;
        var curStep, nextStep, prevStep;
        var t;

        miss = '-';
        stage = 'Uninitialized';
        pr = miss;
        nx = miss;

        curStep = node.game.getCurrentGameStage();

        if (curStep) {
            tmp = node.game.plot.getStep(curStep);
            stage = tmp ? tmp.id : miss;

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
        this.table.addRow(['Current: ', stage]);
        this.table.addRow(['Next: ', nx]);

        t = this.table.selexec('y', '=', 0);
        t.addClass('strong');
        t.selexec('x', '=', 2).addClass('underline');
        this.table.parse();
    };

})(node);
