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

    function NextPreviousStep() {}

    NextPreviousStep.prototype.append = function(root) {
        var rew, fwd;

        rew = document.createElement('button');
        rew.id = this.id + '_rew';
        rew.innerHTML = '<<';
        fwd = document.createElement('button');
        fwd.is = this.id + '_fwd';
        fwd.innerHTML = '>>';

        fwd.onclick = function() {
            node.game.step();
            if (!hasNextStep()) {
                fwd.disabled = 'disabled';
            }
        };

        rew.onclick = function() {
            var prevStep;
            prevStep = node.game.getPreviousStep();
            node.game.gotoStep(prevStep);
            if (!hasPreviousStep()) {
                req.disabled = 'disabled';
            }
        };

        if (node.game.getCurrentGameStage().stage === 0) {
            rew.disabled = 'disabled';
        }

        this.bodyDiv.appendChild(rew);
        this.bodyDiv.appendChild(fwd);
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
