/**
 * # VisualStage
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Shows the name of the current, previous and next step.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('VisualStage', VisualStage);

    // ## Meta-data

    VisualStage.version = '0.7.0';
    VisualStage.description =
        'Displays the name of the current, previous and next step of the game.';

    VisualStage.title = 'Stage';
    VisualStage.className = 'visualstage';

    VisualStage.texts = {
        miss: '',
        current: 'Current: ',
        previous: 'Prev: ',
        next: 'Next: '
    };

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

        // ### VisualStage.table
        //
        // The HTML element containing the information
        this.table = new Table();

        // ### VisualStage.displayMode
        //
        // The display mode: 'compact', 'table'.
        this.displayMode = 'table';

        // ### VisualStage.preprocess
        //
        // A callback function preprocessing the information displayed
        this.preprocess = null;

        // ### VisualStage.capitalize
        //
        // If TRUE, the name/id of a step is capitalized. Default: TRUE.
        this.capitalize = true;

        // Default display settings.

        // ### VisualStage.showRounds
        //
        // If TRUE, round number is added to the name of steps in repeat stages
        this.showRounds = true;

        // ### VisualStage.showPrevious
        //
        // If TRUE, the name of the previuos step is displayed.
        this.showPrevious = true;

        // ### VisualStage.showCurrent
        //
        // If TRUE, the name of the current step is displayed.
        this.showCurrent = true;

        // ### VisualStage.showNext
        //
        // If TRUE, the name of the next step is displayed.
        this.showNext = true;
    }

    // ## VisualStage methods

    VisualStage.prototype.init = function(opts) {
        if ('undefined' !== typeof opts.displayMode) {
            if (opts.displayMode !== 'inline' &&
                opts.displayMode !== 'table') {

                throw new TypeError('VisualStage.init: displayMode must be ' +
                                    '"inline", "table" or undefined. ' +
                                    'Found: ' + opts.displayMode);
            }
            this.displayMode = opts.displayMode;
        }
        if ('undefined' !== typeof opts.rounds) {
            this.showRounds = !!opts.rounds;
        }
        if ('undefined' !== typeof opts.previous) {
            this.showPrevious = !!opts.previous;
        }
        if ('undefined' !== typeof opts.next) {
            this.showNext = !!opts.next;
        }
        if ('undefined' !== typeof opts.current) {
            this.showCurrent = !!opts.current;
        }
        if ('undefined' !== typeof opts.preprocess) {
            if ('function' !== typeof opts.preprocess) {
                throw new TypeError('VisualStage.init: preprocess must be ' +
                                    'function or undefined. Found: ' +
                                    opts.preprocess);
            }
            this.preprocess = opts.preprocess;
        }
        if ('undefined' !== typeof opts.capitalize) {
            this.capitalize = !!opts.capitalize;
        }
    };

    /**
     * ### VisualStage.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see VisualStage.updateDisplay
     */
    VisualStage.prototype.append = function() {
        if (this.displayMode === 'table') {
            this.bodyDiv.appendChild(this.table.table);
        }
        else {
            this.div = W.append('div', this.bodyDiv);
        }
        this.updateDisplay();
    };

    VisualStage.prototype.listeners = function() {
        var that = this;
        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateDisplay();
        });
        // Game over and init?
    };

    /**
     * ### VisualStage.updateDisplay
     *
     * Writes the current, previous and next step into `this.table`
     *
     * It uses the step property `name`, if existing, otherwise `id`.
     * Depending on current settings, it capitalizes it, and preprocess it.
     *
     * @see VisualStage.getStepName
     */
    VisualStage.prototype.updateDisplay = function() {
        var name, str;
        var curStep, nextStep, prevStep;
        var curStepName, nextStepName, prevStepName;
        var t;

        curStep = node.game.getCurrentGameStage();

        this.table.clear(true);

        if (curStep) {
            if (this.showCurrent) {
                curStepName = this.getStepName(curStep, curStep, 'current');
            }
            if (this.showNext) {
                nextStep = node.game.plot.next(curStep);
                if (nextStep) {
                    nextStepName = this.getStepName(nextStep, curStep, 'next');
                }
            }
            if (this.showPrevious) {
                prevStep = node.game.plot.previous(curStep);
                if (prevStep) {
                    prevStepName = this.getStepName(prevStep, curStep,
                                                    'previous');
                }
            }
        }

        if (this.displayMode === 'table') {
            str = this.getText('current');
            name = str === false ? [ curStepName ] : [ str, curStepName ];
            this.table.addRow(name);
            str = this.getText('previous');
            name = str === false ? [ prevStepName ] : [ str, prevStepName ];
            this.table.addRow(name);
            str = this.getText('next');
            name = str === false ? [ nextStepName ] : [ str, nextStepName ];
            this.table.addRow(name);
            //
            t = this.table.selexec('y', '=', 0);
            t.addClass('strong');
            t.selexec('x', '=', 1).addClass('underline');
            this.table.parse();
        }
        else {
            this.div.innerHTML = '';
            if (curStepName) {
                W.add('span', this.div, {
                    className: 'curstep',
                    innerHTML: curStepName,
                    className: 'visualstage-curr'
                });
            }
            if (nextStepName) {
                W.add('span', this.div, {
                    className: 'nextstep',
                    innerHTML: '<strong>' + this.getText('next') + '</strong>'+
                        nextStepName,
                    className: 'visualstage-next'
                });
            }
            if (prevStepName) {
                W.add('span', this.div, {
                    className: 'prevstep',
                    innerHTML: '<strong>' + this.getText('previous') +
                        '</strong>' + prevStepName,
                    className: 'visualstage-prev'
                });
            }
            this.setTitle(false);
        }
    };

    /**
     * ### VisualStage.getStepName
     *
     * Returns the step name of a given step
     *
     * @param {GameStage} gameStage The game stage we want to to get the name
     * @param {GameStage} gameStage The current game stage
     * @param {string} A modifier: 'current', 'previous', 'next'.
     *
     * @return {string} name The name of the step
     *
     * @see getName
     */
    VisualStage.prototype.getStepName = function(gameStage, curStage, mod) {
        var name, round;
        name = getName(gameStage, this.getText('miss'));
        if (this.capitalize) name = capitalize(name);
        if (this.showRounds) {
            round = getRound(gameStage, curStage, mod);
            if (round) name += ' ' + round;
        }
        if (this.preprocess) name = this.preprocess(name, mod, round);
        return name;
    };

    // ## Helper functions.


    /**
     * ### getRound
     *
     * Returns the round for a given step, if its stage is a repeat stage
     *
     * @param {GameStage} gameStage The game stage we want to to get the round
     * @param {GameStage} gameStage The current game stage
     * @param {string} A modifier: 'current', 'previous', 'next'.
     *
     * @return {number} round The round for the step
     *
     * @see getName
     */
    function getRound(gameStage, curStage, mod) {
        var round, totRounds;
        if (!gameStage.stage) return;
        totRounds = node.game.plot.stager.sequence[(gameStage.stage - 1)].num;
        if (!totRounds) return;
        round = node.game.getRound();
        // Same stage: can be current, next, or previous.
        if (curStage.stage === gameStage.stage) {
            if (mod === 'next') round++;
            else if (mod === 'previous') round--;
        }
        // This is a previous stage.
        else if (curStage.stage > gameStage.stage) {
            round = totRounds;
        }
        // This is a next stage.
        else {
            round = 1;
        }
        return round;
    };

    // ### getName
    //
    // Returns the name or the id property or miss.
    function getName(gameStage, miss) {
        var tmp;
        tmp = node.game.plot.getProperty(gameStage, 'name');
        if (!tmp) {
            tmp = node.game.plot.getStep(gameStage);
            tmp = tmp ? tmp.id : miss;
        }
        return tmp;
    }

    function capitalize(str) {
        var tks, i, len;
        tks = str.split(' ');
        str = capWord(tks[0]);
        len = tks.length;
        if (len > 1) str += ' ' + capWord(tks[1]);
        if (len > 2) {
            for (i = 2; i < len; i++) {
                str += ' ' + capWord(tks[i]);
            }
        }
        return str;
    }

    function capWord(word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    }

})(node);
