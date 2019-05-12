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

    VisualStage.version = '0.8.0';
    VisualStage.description =
        'Displays the name of the current, previous and next step of the game.';

    VisualStage.title = false;
    VisualStage.className = 'visualstage';

    VisualStage.texts = {
        miss: '',
        current: 'Stage: ',
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
     */
    function VisualStage() {

        // ### VisualStage.displayMode
        //
        // The display mode: 'compact', 'table'.
        this.displayMode = 'inline';

        // ### VisualStage.table
        //
        // The HTML element containing the information in 'table' mode
        this.table = null;

        // ### VisualStage.preprocess
        //
        // A callback function preprocessing the information displayed
        this.preprocess = null;

        // ### VisualStage.order
        //
        // The order in which information is displayed, if available.
        //
        // In 'init' it gets reassigned based on displayMode.
        this.order = [ 'current', 'next', 'previous' ];

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
        var err;
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
        if ('undefined' !== typeof opts.order) {
            if (!J.isArray(opts.order) || opts.order.length !== 3) {
                throw new TypeError('VisualStage.init: order must be ' +
                                    'an array of length 3 or undefined. ' +
                                    'Found: ' + opts.order);
            }
            err = checkOrderOption(opts.order, this.order.slice(0));
            if (err) {
                throw new TypeError('VisualStage.init: order contains ' +
                                    'errors: ' + order);
            }
            this.order = opts.order;
        }
        else {
            if (this.displayMode === 'inline') {
                this.order = [ 'previous', 'current', 'next' ];
            }
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
            this.table = new Table();
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
     * Writes the current, previous and next step names
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
        var order, t, tmp;

        order = {};
        curStep = node.game.getCurrentGameStage();
        if (curStep) {
            if (this.showCurrent) {
                curStepName = this.getStepName(curStep, curStep, 'current');
                order.current = curStepName;
            }
            if (this.showNext) {
                nextStep = node.game.plot.next(curStep);
                if (nextStep) {
                    nextStepName = this.getStepName(nextStep, curStep, 'next');
                    order.next = nextStepName;
                }
            }
            if (this.showPrevious) {
                prevStep = node.game.plot.previous(curStep);
                if (prevStep) {
                    prevStepName = this.getStepName(prevStep, curStep,
                                                    'previous');
                    order.previous = prevStepName;
                }
            }
        }

        if (this.displayMode === 'table') {
            this.table.clear(true);
            addRow(this, 0, order);
            addRow(this, 1, order);
            addRow(this, 2, order);
            //
            t = this.table.selexec('y', '=', 0);
            t.addClass('strong');
            // t.selexec('x', '=', 1).addClass('underline');
            this.table.parse();
        }
        else {
            this.div.innerHTML = '';
            addSpan(this, 0, order);
            addSpan(this, 1, order);
            addSpan(this, 2, order);
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
    }

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

    function addRow(that, idx, order) {
        var row, str, type, name, className, obj;
        type = that.order[idx];
        str = that.getText(type);
        name = order[type];
        if (!name) return;
        className = 'visualstage-' + type;
        obj = {
            className: className,
            content: name
        };
        if (str === false) row = [ obj ];
        else if (type === 'current') row = [ { content: name, colspan: 2 } ];
        else row = [ { className: className, content: str }, obj ];
        that.table.addRow(row);
    }

    function addSpan(that, idx, order) {
        var str, tmp;
        tmp = that.order[idx];
        str = order[tmp];
        if (!str) return;
        if (tmp !== 'current') {
            str = '<span class="strong">' +
                that.getText(tmp) + '</span>' + str;
        }
        W.add('span', that.div, {
            innerHTML: str,
            className: 'visualstage-' + tmp
        });
    }

    function checkOrderOption(order, arr) {
        var i;
        i = arr.indexOf(order[0]);
        if (i === -1) return 'unknown item: ' + order[0];
        arr.splice(i,1);
        i = arr.indexOf(order[1]);
        if (i === -1) return 'unknown item: ' + order[1];
        arr.splice(i,1);
        i = arr.indexOf(order[2]);
        if (i === -1) return 'unknown item: ' + order[2];
        arr.splice(i,1);
        if (arr.length) return 'duplicated entry: ' + arr[0];
        return;
    }

})(node);
