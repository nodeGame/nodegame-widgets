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

    VisualStage.version = '0.6.0';
    VisualStage.description =
        'Displays the name of the current, previous and next step of the game.';

    VisualStage.title = 'Stage';
    VisualStage.className = 'visualstage';

    VisualStage.texts = {
        miss: '-',
        current: function(w) {
            if (w.displayMode === 'Current: ',
        previous: 'Previous: ',
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

        // ### VisualStage.showPrevious
        //
        // If TRUE, the name of the previuos step is displayed.
        this.showPrevious = true;
        // If TRUE, the name of the current step is displayed.
        this.showCurrent = true;
        // If TRUE, the name of the next step is displayed.
        this.showNext = true;

    }

    // ## VisualStage methods

    VisualStage.prototype.init = function(opts) {
        if ('undefined' !== typeof opts.displayMode) {
            if (opts.displayMode !== 'compact' &&
                opts.displayMode !== 'table') {

                throw new TypeError('VisualStage.init: displayMode must be ' +
                                    '"compact", "table" or undefined.' +
                                    'Found: ' + opts.displayMode);
            }
            this.displayMode = opts.displayMode;
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
                curStepName = this.getStepName(curStep, 'current');
            }
            if (this.showNext) {
                nextStep = node.game.plot.next(curStep);
                if (nextStep) {
                    nextStepName = this.getStepName(nextStep, 'next');
                }
            }
            if (this.showPrevious) {
                prevStep = node.game.plot.previous(curStep);
                if (prevStep) {
                    prevStepName = this.getStepName(prevStep, 'previous');
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
            if (prevStepName) {
                W.add('span', this.div, {
                    className: 'prevstep',
                    innerHMTL: prevStepName
                });
            }
            if (curStepName) {
                W.add('span', this.div, {
                    className: 'curstep',
                    innerHMTL: curStepName
                });
            }
            if (nextStepName) {
                W.add('span', this.div, {
                    className: 'nextstep',
                    innerHMTL: nextStepName
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
     * @param {GameStage} gameStage A game stage
     * @param {string} A modifier: 'current', 'previous', 'next'.
     *
     * @return {string} name The name of the step
     *
     * @see getName
     */
    VisualStage.prototype.getStepName = function(gameStage, mod) {
        var name;
        name = getName(gameStage, this.getText('miss'));
        if (this.capitalize) name = capitalize(name);
        if (this.preprocess) name = this.preprocess(name, mod);
        return name;
    };

    // ## Helper functions.

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
        var tks, str, i, len;
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
