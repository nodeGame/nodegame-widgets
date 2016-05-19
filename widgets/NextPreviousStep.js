/**
 * # NextPreviousStep
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Simple widget to step through the stages of the game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('NextPreviousStep', NextPreviousStep);

    // ## Meta-data

    NextPreviousStep.className = 'nextprevious';
    NextPreviousStep.title = 'Next/Previous Step';

    NextPreviousStep.version = '1.0.0';
    NextPreviousStep.description = 'Adds two buttons to push forward or ' +
        'rewind the state of the game by one step.';

    /**
     * ## NextPreviousStep constructor
     */
    function NextPreviousStep() {

        /**
         * ### NextPreviousStep.rew
         *
         * The button to go one step back
         */
        this.rew = null;

        /**
         * ### NextPreviousStep.fwd
         *
         * The button to go one step forward
         */
        this.fwd = null;

        /**
         * ### NextPreviousStep.checkbox
         *
         * The checkbox to call `node.done` on forward
         */
        this.checkbox = null;
    }

    /**
     * ### NextPreviousStep.append
     *
     * Appends the widget
     *
     * Creates two buttons and a checkbox
     */
    NextPreviousStep.prototype.append = function() {
        var that, spanDone;
        that = this;

        this.rew = document.createElement('button');
        this.rew.innerHTML = '<<';

        this.fwd = document.createElement('button');
        this.fwd.innerHTML = '>>';

        this.checkbox = document.createElement('input');
        this.checkbox.type = 'checkbox';

        this.fwd.onclick = function() {
            if (that.checkbox.checked) node.done();
            else node.game.step();
            if (!hasNextStep()) {
                that.fwd.disabled = 'disabled';
            }
        };

        this.rew.onclick = function() {
            var prevStep;
            prevStep = node.game.getPreviousStep();
            node.game.gotoStep(prevStep);
            if (!hasPreviousStep()) {
                that.rew.disabled = 'disabled';
            }
        };

        if (!hasPreviousStep()) this.rew.disabled = 'disabled';
        if (!hasNextStep()) this.fwd.disabled = 'disabled';

        // Buttons.
        this.bodyDiv.appendChild(this.rew);
        this.bodyDiv.appendChild(this.fwd);

        // Checkbox.
        spanDone = document.createElement('span');
        spanDone.appendChild(document.createTextNode('node.done'));
        spanDone.appendChild(this.checkbox);
        this.bodyDiv.appendChild(spanDone);
    };

    function hasNextStep() {
        var nextStep;
        nextStep = node.game.getNextStep();
        if (!nextStep ||
            nextStep === node.GamePlot.GAMEOVER ||
            nextStep === node.GamePlot.END_SEQ ||
            nextStep === node.GamePlot.NO_SEQ) {

            return false;
        }
        return true;
    }

    function hasPreviousStep() {
        var prevStep;
        prevStep = node.game.getPreviousStep();
        if (!prevStep) {
            return false;
        }
        return true;
    }

})(node);
