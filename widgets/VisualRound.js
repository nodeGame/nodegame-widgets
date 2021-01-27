/**
 * # VisualRound
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Display information about rounds and/or stage in the game
 *
 * Accepts different visualization options (e.g. countdown, etc.).
 * See `VisualRound` constructor for a list of all available options.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualRound', VisualRound);

    // ## Meta-data

    VisualRound.version = '0.9.0';
    VisualRound.description = 'Displays current/total/left round/stage/step. ';

    VisualRound.title = false;
    VisualRound.className = 'visualround';

    VisualRound.texts = {
        round: 'Round',
        step: 'Step',
        stage: 'Stage',
        roundLeft: 'Rounds Left',
        stepLeft: 'Steps Left',
        stageLeft: 'Stages Left'
    };

    // ## Dependencies

    VisualRound.dependencies = {
        GamePlot: {},
        JSUS: {}
    };

    /**
     * ## VisualRound constructor
     *
     * Displays information on the current and total rounds and stages
     */
    function VisualRound() {

        /**
         * ### VisualRound.options
         *
         * Current configuration
         */
        this.options = null;

        /**
         * ### VisualRound.displayMode
         *
         * Object which determines what information is displayed
         *
         * @see VisualRound.setDisplayMode
         */
        this.displayMode = null;

        /**
         * ### VisualRound.stager
         *
         * Reference to a `GameStager` object providing stage and round info
         *
         * @see GameStager
         */
        this.stager = null;

        /**
         * ### VisualRound.gamePlot
         *
         * `GamePlot` object to provide stage and round information
         *
         * @see GamePlot
         */
        this.gamePlot = null;

        /**
         * ### VisualRound.curStage
         *
         * Number of the current stage
         */
        this.curStage = null;

        /**
         * ### VisualRound.totStage
         *
         * Total number of stages. Might be null if in `flexibleMode`
         */
        this.totStage = null;

        /**
         * ### VisualRound.curRound
         *
         * Number of the current round
         */
        this.curRound = null;

        /**
         * ### VisualRound.totRound
         *
         * Total number of rounds. Might be null if in `flexibleMode`
         */
        this.totRound = null;

        /**
         * ### VisualRound.stageOffset
         *
         * Stage displayed is the actual stage minus stageOffset
         */
        this.stageOffset = null;

        /**
         * ### VisualRound.totStageOffset
         *
         * Total number of stages displayed minus totStageOffset
         *
         * If not set, and it is set equal to stageOffset
         */
        this.totStageOffset = null;

        /**
         * ### VisualRound.oldStageId
         *
         * Stage id of the previous stage
         *
         * Needed in `flexibleMode` to count rounds.
         */
        this.oldStageId = null;

        /**
         * ### VisualRound.separator
         *
         * Stages and rounds are separated with this string, if needed
         *
         * E.g., Stage 3/5
         */
        this.separator = ' / ';

        /**
         * ### VisualRound.layout
         *
         * Display layout
         *
         * @see VisualRound.setLayout
         */
        this.layout = null;

    }

    // ## VisualRound methods

    /**
     * ### VisualRound.init
     *
     * Initializes the instance
     *
     * If called on running instance, options are mixed-in into current
     * settings. See `VisualRound` constructor for which options are allowed.
     *
     * @param {object} options Optional. Configuration options.
     *   The options it can take are:
     *
     *   - `stageOffset`:
     *     Stage displayed is the actual stage minus stageOffset
     *   - `preprocess`: a function that may modify information about
     *     steps, rounds and stages before they are displayed; its context
     *     is the current widget and it receives an object to modify:
     *     ```js
     *     {
     *       totRound: 1,
     *       totStep: 2,
     *       totStage: 5,
     *       curStep: 1,
     *       curStage: 1,
     *       curRound: 1
     *     }
     *   ```
     *   - `flexibleMode`:
     *     Set `true`, if number of rounds and/or stages can change dynamically
     *   - `curStage`:
     *     When (re)starting in `flexibleMode`, sets the current stage
     *   - `curRound`:
     *     When (re)starting in `flexibleMode`, sets the current round
     *   - `totStage`:
     *     When (re)starting in `flexibleMode`, sets the total number of stages
     *   - `totRound`:
     *     When (re)starting in `flexibleMode`, sets the total number of
     *     rounds
     *   - `oldStageId`:
     *     When (re)starting in `flexibleMode`, sets the id of the current
     *     stage
     *
     *
     * @see VisualRound.setDisplayMode
     * @see GameStager
     * @see GamePlot
     */
    VisualRound.prototype.init = function(options) {
        options = options || {};

        J.mixout(options, this.options);
        this.options = options;

        this.stageOffset = this.options.stageOffset || 0;
        this.totStageOffset =
            'undefined' === typeof this.options.totStageOffset ?
            this.stageOffset : this.options.totStageOffset;

        if (this.options.flexibleMode) {
            this.curStage = this.options.curStage || 1;
            this.curStage -= this.options.stageOffset || 0;
            this.curStep = this.options.curStep || 1;
            this.curRound = this.options.curRound || 1;
            this.totStage = this.options.totStage;
            this.totRound = this.options.totRound;
            this.totStep = this.options.totStep;
            this.oldStageId = this.options.oldStageId;
        }

        // Save references to gamePlot and stager for convenience.
        if (!this.gamePlot) this.gamePlot = node.game.plot;
        if (!this.stager) this.stager = this.gamePlot.stager;

        this.updateInformation();

        if (!this.options.displayMode && this.options.displayModeNames) {
            console.log('***VisualTimer.init: options.displayModeNames is ' +
                        'deprecated. Use options.displayMode instead.***');
            this.options.displayMode = this.options.displayModeNames;
        }

        if (!this.options.displayMode) {
            this.setDisplayMode([
                'COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1',
                'COUNT_UP_STAGES_TO_TOTAL'
            ]);
        }
        else {
            this.setDisplayMode(this.options.displayMode);
        }

        if ('undefined' !== typeof options.separator) {
            this.separator = options.separator;
        }

        if ('undefined' !== typeof options.layout) {
            this.layout = options.layout;
        }

        if ('undefined' !== typeof options.preprocess) {
            if ('function' === typeof options.preprocess) {
                this.preprocess = options.preprocess;
            }
            else {
                throw new TypeError('VisualRound.init: preprocess must ' +
                                    'function or undefined. Found: ' +
                                    options.preprocess);
            }
        }

        this.updateDisplay();
    };

    VisualRound.prototype.append = function() {
        this.activate(this.displayMode);
        this.updateDisplay();
    };

    /**
     * ### VisualRound.updateDisplay
     *
     * Updates the values displayed by forwarding the call to displayMode obj
     *
     * @see VisualRound.displayMode
     */
    VisualRound.prototype.updateDisplay = function() {
        if (this.displayMode) this.displayMode.updateDisplay();
    };

    /**
     * ### VisualRound.setDisplayMode
     *
     * Sets the `VisualRound.displayMode` value
     *
     * Multiple displayModes are allowed, and will be merged together into a
     * `CompoundDisplayMode` object. The old `displayMode` is deactivated and
     * the new one is activated.
     *
     * The following strings are valid display names:
     *
     * - `COUNT_UP_STAGES`: Display only current stage number.
     * - `COUNT_UP_STEPS`: Display only current step number.
     * - `COUNT_UP_STEPS_IFNOT1`: Skip stages with one step.
     * - `COUNT_UP_ROUNDS`: Display only current round number.
     * - `COUNT_UP_ROUNDS_IFNOT1`: Skip stages with one round.
     * - `COUNT_UP_STAGES_TO_TOTAL`: Display current and total stage number.
     * - `COUNT_UP_ROUNDS_TO_TOTAL`: Display current and total round number.
     * - `COUNT_UP_STEPS_TO_TOTAL`: Display current and total step number.
     * - `COUNT_UP_STEPS_TO_TOTAL_IFNOT1`: Skip stages with one step.
     * - `COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1`: Skip stages with one round.
     * - `COUNT_DOWN_STAGES`: Display number of stages left to play.
     * - `COUNT_DOWN_STEPS`: Display number of steps left to play.
     * - `COUNT_DOWN_ROUNDS`: Display number of rounds left in this stage.
     *
     * @param {array|string} displayMode Array of strings representing the names
     *
     * @see VisualRound.displayMode
     * @see CompoundDisplayMode
     * @see VisualRound.init
     */
    VisualRound.prototype.setDisplayMode = function(displayMode) {
        var i, len, displayModes;

        if ('string' === typeof displayMode) {
            displayMode = [ displayMode ];
        }
        else if (!J.isArray(displayMode)) {
            throw new TypeError('VisualRound.setDisplayMode: ' +
                                'displayMode must be array or string. ' +
                                'Found: ' + displayMode);
        }
        len = displayMode.length;
        if (len === 0) {
            throw new Error('VisualRound.setDisplayMode: displayMode is empty');
        }

        if (this.displayMode) {
            // Nothing to do if mode is already active.
            if (displayMode.join('&') === this.displayMode.name) return;
            this.deactivate(this.displayMode);
        }

        // Build `CompoundDisplayMode`.
        displayModes = [];
        i = -1;
        for (; ++i < len; ) {
            switch (displayMode[i]) {
            case 'COUNT_UP_STAGES_TO_TOTAL':
                displayModes.push(new CountUpStages(this, { toTotal: true }));
                break;
            case 'COUNT_UP_STAGES':
                displayModes.push(new CountUpStages(this));
                break;
            case 'COUNT_DOWN_STAGES':
                displayModes.push(new CountDownStages(this));
                break;
            case 'COUNT_UP_STEPS_TO_TOTAL':
                displayModes.push(new CountUpSteps(this, { toTotal: true }));
                break;
            case 'COUNT_UP_STEPS_TO_TOTAL_IFNOT1':
                displayModes.push(new CountUpSteps(this, {
                    toTotal: true,
                    ifNotOne: true
                }));
                break;
            case 'COUNT_UP_STEPS':
                displayModes.push(new CountUpSteps(this));
                break;
            case 'COUNT_UP_STEPS_IFNOT1':
                displayModes.push(new CountUpSteps(this, { ifNotOne: true }));
                break;
            case 'COUNT_DOWN_STEPS':
                displayModes.push(new CountDownSteps(this));
                break;
            case 'COUNT_UP_ROUNDS_TO_TOTAL':
                displayModes.push(new CountUpRounds(this, { toTotal: true }));
                break;
            case 'COUNT_UP_ROUNDS':
                displayModes.push(new CountUpRounds(this));
                break;
            case 'COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1':
                displayModes.push(new CountUpRounds(this, {
                    toTotal: true,
                    ifNotOne: true
                }));
                break;
            case 'COUNT_UP_ROUNDS_IFNOT1':
                displayModes.push(new CountUpRounds(this, { ifNotOne: true }));
                break;
            case 'COUNT_DOWN_ROUNDS':
                displayModes.push(new CountDownRounds(this));
                break;
            default:
                throw new Error('VisualRound.setDisplayMode: unknown mode: ' +
                                displayMode[i]);
            }
        }
        this.displayMode = new CompoundDisplayMode(this, displayModes);
        this.activate(this.displayMode);
    };

    /**
     * ### VisualRound.getDisplayMode
     *
     * Returns name of the current displayMode
     *
     * @return {string} Name of the current displayMode
     */
    VisualRound.prototype.getDisplayModeName = function() {
        return this.displayMode.name;
    };

    /**
     * ### VisualRound.activate
     *
     * Appends the displayDiv of the given displayMode to `this.bodyDiv`
     *
     * Calls `displayMode.activate`, if one is defined.
     *
     * @param {object} displayMode DisplayMode to activate
     *
     * @see VisualRound.deactivate
     */
    VisualRound.prototype.activate = function(displayMode) {
        if (this.bodyDiv) this.bodyDiv.appendChild(displayMode.displayDiv);
        if (displayMode.activate) displayMode.activate();
    };

    /**
     * ### VisualRound.deactivate
     *
     * Removes the displayDiv of the given displayMode from `this.bodyDiv`
     *
     * Calls `displayMode.deactivate` if it is defined.
     *
     * @param {object} displayMode DisplayMode to deactivate
     *
     * @see VisualRound.activate
     */
    VisualRound.prototype.deactivate = function(displayMode) {
        this.bodyDiv.removeChild(displayMode.displayDiv);
        if (displayMode.deactivate) displayMode.deactivate();
    };

    VisualRound.prototype.listeners = function() {
        var that;
        that = this;
        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateInformation();
        });
        // TODO: Game over and init?
    };

    /**
     * ### VisualRound.updateInformation
     *
     * Updates information about rounds and stages and updates the display
     *
     * Updates `curRound`, `curStage`, `totRound`, `totStage`, `oldStageId` and
     * calls `VisualRound.updateDisplay`.
     *
     * @see VisualRound.updateDisplay
     */
    VisualRound.prototype.updateInformation = function() {
        var stage, len, tmp;

        stage = node.player.stage;

        // Game not started.
        if (stage.stage === 0) {
            this.curStage = 0;
            this.totStage = 0;
            this.totRound = 0;
        }
        // Flexible mode.
        else if (this.options.flexibleMode) {
            if (stage.id === this.oldStageId) {
                this.curRound += 1;
            }
            else if (stage.id) {
                this.curRound = 1;
                this.curStage += 1;
            }
            this.oldStageId = stage.id;
        }
        // Normal mode.
        else {

            // Compute current values.

            this.curStage = stage.stage;
            // Stage can be indexed by id or number in the sequence.
            if ('string' === typeof this.curStage) {
                this.curStage =
                    this.gamePlot.normalizeGameStage(stage).stage;
            }
            this.curStage -= this.stageOffset;
            this.curStep = stage.step;
            this.curRound = stage.round;

            // Compute total values.

            len = this.stager.sequence.length;
            this.totStage = len - this.totStageOffset;
            if (this.stager.sequence[(len-1)].type === 'gameover') {
                this.totStage--;
            }

            tmp = this.stager.sequence[this.curStage -1];
            this.totRound = tmp.num || 1;
            this.totStep = tmp.steps.length;

            // Let user preprocess.
            if (this.preprocess) {
                tmp = {
                    totRound: this.totRound,
                    totStep: this.totStep,
                    totStage: this.totStage,
                    curStep: this.curStep,
                    curStage: this.curStage,
                    curRound: this.curRound,
                };
                this.preprocess(tmp);

                this.curRound = tmp.curRound
                this.curStep = tmp.curStep;
                this.curStage = tmp.curStage
                this.totStage = tmp.totStage;
                this.totStep = tmp.totStep;
                this.totRound = tmp.totRound;
            }
        }
        // Update display.
        this.updateDisplay();
    };

    /**
     * ### VisualRound.setLayout
     *
     * Arranges the relative position of the various elements of VisualRound
     *
     * @param {string} layout. Valid options:
     *   - 'vertical' (alias: 'multimode_vertical')
     *   - 'horizontal'
     *   - 'multimode_horizontal'
     *   - 'all_horizontal'
     */
    VisualRound.prototype.setLayout = function(layout) {
        if ('string' !== typeof layout || layout.trim() === '') {
            throw new TypeError('VisualRound.setLayout: layout must be ' +
                                'a non-empty string. Found: ' + layout);
        }
        this.layout = layout;
        if (this.displayMode) this.displayMode.setLayout(layout);
    };

    // ## Display Modes.

    /**
     * # CountUpStages
     *
     * Display current/total number of stages
     */

    /**
     * ## CountUpStages constructor
     *
     * DisplayMode which displays the current number of stages
     *
     * Can be constructed to furthermore display the total number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options.
     *   If `options.toTotal == true`, then the total number of stages is
     *   displayed
     */
    function CountUpStages(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_STAGES', options);
        generalInit(this, 'stagediv', this.visualRound.getText('stage'));
    }

    // ## CountUpStages methods

    /**
     * ### CountUpStages.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpStages.prototype.updateDisplay = function() {
        this.current.innerHTML = this.visualRound.curStage;
        if (this.total) this.total.innerHTML = this.visualRound.totStage || '?';
    };

   /**
     * # CountDownStages
     *
     * Defines a displayMode for the `VisualRound` which displays the remaining
     * number of stages
     */

    /**
     * ## CountDownStages constructor
     *
     * Display mode which displays the remaining number of stages
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs.
     * @param {object} options Optional. Configuration options
     */
    function CountDownStages(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_STAGES', options);
        generalInit(this, 'stagediv', visualRound.getText('stageLeft'));
    }

    // ## CountDownStages methods

    /**
     * ### CountDownStages.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     */
    CountDownStages.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totStage === v.curStage) {
            this.current.innerHTML = 0;
        }
        else {
            this.current.innerHTML = (v.totStage - v.curStage) || '?';
        }
    };

    /**
      * # CountUpSteps
      *
      * Displays the current/total number of steps
      */

    /**
     * ## CountUpSteps constructor
     *
     * DisplayMode which displays the current number of stages
     *
     * Can be constructed to furthermore display the total number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options.
     *   If `options.toTotal == true`, then the total number of stages is
     *   displayed
     */
    function CountUpSteps(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_STEPS', options);
        generalInit(this, 'stepdiv', this.visualRound.getText('step'));
    }

    /**
     * ### CountUpSteps.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpSteps.prototype.updateDisplay = function() {
        if (this.options.ifNotOne && this.visualRound.totStep === 1) {
            this.displayDiv.style.display = 'none';
        }
        else {
            this.current.innerHTML = this.visualRound.curStep;
            if (this.total) {
                this.total.innerHTML = this.visualRound.totStep || '?';
            }
            this.displayDiv.style.display = '';
        }
    };

   /**
     * # CountDownSteps
     *
     * DisplayMode which displays the remaining number of steps
     */

    /**
     * ## CountDownStages constructor
     *
     * Display mode which displays the remaining number of steps
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs.
     * @param {object} options Optional. Configuration options
     */
    function CountDownSteps(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_STEPS', options);
        generalInit(this, 'stepdiv', this.visualRound.getText('stepLeft'));
    }

    // ## CountDownSteps methods

    /**
     * ### CountDownSteps.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     */
    CountDownSteps.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totStep === v.curStep) this.current.innerHTML = 0;
        else this.current.innerHTML = (v.totStep - v.curStep) || '?';
    };

   /**
     * # CountUpRounds
     *
     * Displays the current and possibly the total number of rounds
     */

    /**
     * ## CountUpRounds constructor
     *
     * Display mode which displays the current number of rounds
     *
     * Can be constructed to furthermore display the total number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of rounds is displayed
     */
    function CountUpRounds(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_ROUNDS', options);
        generalInit(this, 'rounddiv', visualRound.getText('round'));
    }

    // ## CountUpRounds methods

    /**
     * ### CountUpRounds.updateDisplay
     *
     * Updates the content of `curRoundNumber` and `totRoundNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpRounds.prototype.updateDisplay = function() {
        if (this.options.ifNotOne && this.visualRound.totRound === 1) {
            this.displayDiv.style.display = 'none';
        }
        else {
            this.current.innerHTML = this.visualRound.curRound;
            if (this.total) {
                this.total.innerHTML = this.visualRound.totRound || '?';
            }
            this.displayDiv.style.display = '';
        }
    };


   /**
     * # CountDownRounds
     *
     * Displays the remaining number of rounds
     */

    /**
     * ## CountDownRounds constructor
     *
     * Display mode which displays the remaining number of rounds
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     */
    function CountDownRounds(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_ROUNDS', options);
        generalInit(this, 'rounddiv', visualRound.getText('roundLeft'));
    }

    // ## CountDownRounds methods

    /**
     * ### CountDownRounds.updateDisplay
     *
     * Updates the content of `roundsLeft` according to `visualRound`
     */
    CountDownRounds.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totRound === v.curRound) this.current.innerHTML = 0;
        else this.current.innerHTML = (v.totRound - v.curRound) || '?';
    };

    /**
     * # CompoundDisplayMode
     *
     * Creates a display mode which groups together other display modes
     */

    /**
     * ## CompoundDisplayMode constructor
     *
     * Display mode which combines multiple other display displayModes
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {array} displayModes Array of displayModes to be used in
     *   combination
     * @param {object} options Optional. Configuration options
     */
    function CompoundDisplayMode(visualRound, displayModes, options) {

        /**
         * ### CompoundDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         */
        this.visualRound = visualRound;

         /**
         * ### CompoundDisplayMode.displayModes
         *
         * The array of displayModes to be used in combination
         */
        this.displayModes = displayModes;

        /**
         * ### CompoundDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = displayModes.join('&');

        /**
         * ### CompoundDisplayMode.options
         *
         * Current options
         */
        this.options = options || {};

        /**
         * ### CompoundDisplayMode.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        this.init(options);
    }

    // ## CompoundDisplayMode methods

    /**
     * ### CompoundDisplayMode.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CompoundDisplayMode.updateDisplay
     */
     CompoundDisplayMode.prototype.init = function() {
         var i, len;
         this.displayDiv = W.get('div');
         i = -1, len = this.displayModes.length;
         for (; ++i < len; ) {
             this.displayDiv.appendChild(this.displayModes[i].displayDiv);
         }
         this.updateDisplay();
     };

    /**
     * ### CompoundDisplayMode.updateDisplay
     *
     * Calls `updateDisplay` for all displayModes in the combination
     */
    CompoundDisplayMode.prototype.updateDisplay = function() {
        var i, len;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            this.displayModes[i].updateDisplay();
        }
    };

    CompoundDisplayMode.prototype.activate = function() {
        var i, len, d, layout;
        layout = this.visualRound.layout;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            if (d.activate) this.displayModes[i].activate();
            if (layout) setLayout(d, layout, i === (len-1));
        }
    };

    CompoundDisplayMode.prototype.deactivate = function() {
        var i, len, d;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            if (d.deactivate) d.deactivate();
        }
    };

    CompoundDisplayMode.prototype.setLayout = function(layout) {
        var i, len, d;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            setLayout(d, layout, i === (len-1));
        }
    };

    // ## Helper Methods.

    function setLayout(d, layout, lastDisplay) {
        if (layout === 'vertical' || layout === 'multimode_vertical' ||
            layout === 'all_vertical') {

            d.displayDiv.style.float = 'none';
            d.titleDiv.style.float = 'none';
            d.titleDiv.style['margin-right'] = '0px';
            d.contentDiv.style.float = 'none';
            return true;
        }
        if (layout === 'horizontal') {
            d.displayDiv.style.float = 'none';
            d.titleDiv.style.float = 'left';
            d.titleDiv.style['margin-right'] = '6px';
            d.contentDiv.style.float = 'right';
            return true;
        }
        if (layout === 'multimode_horizontal') {
            d.displayDiv.style.float = 'left';
            d.titleDiv.style.float = 'none';
            d.titleDiv.style['margin-right'] = '0px';
            d.contentDiv.style.float = 'none';
            if (!lastDisplay) {
                d.displayDiv.style['margin-right'] = '10px';
            }
            return true;
        }
        if (layout === 'all_horizontal') {
            d.displayDiv.style.float = 'left';
            d.titleDiv.style.float = 'left';
            d.titleDiv.style['margin-right'] = '6px';
            d.contentDiv.style.float = 'right';
            if (!lastDisplay) {
                d.displayDiv.style['margin-right'] = '10px';
            }
            return true;
        }
        return false;
    }

    /**
     * ### generalConstructor
     *
     * Sets up the basic attributes of visualization mode for VisualRound
     *
     * @param {object} that The visualization mode instance
     * @param {VisualRound} visualRound The VisualRound instance
     * @param {string} name The name of the visualization mode
     * @param {object} options Additional options, e.g. 'toTotal'
     */
    function generalConstructor(that, visualRound, name, options) {
        options = options || {};

        /**
         * #### visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         */
        that.visualRound = visualRound;

        /**
         * #### name
         *
         * The name of the displayMode
         */
        that.name = name;
        if (options.toTotal) that.name += '_TO_TOTAL';

        /**
         * #### options
         *
         * The options for this instance
         */
        that.options = options;

        /**
         * #### displayDiv
         *
         * The DIV in which the information is displayed
         */
        that.displayDiv = null;

        /**
         * #### displayDiv
         *
         * The DIV in which the title is displayed
         */
        that.titleDiv = null;

        /**
         * #### contentDiv
         *
         * The DIV containing the actual information
         */
        that.contentDiv = null;

        /**
         * #### current
         *
         * The span in which the number (of rounds, steps, stages) is displayed
         */
        that.current = null;

        /**
         * #### textDiv
         *
         * The span in which the text ` of ` is displayed
         *
         * It is created only if the display mode requires it
         */
        that.textDiv = null;

        /**
         * #### total
         *
         * The span in which the total number (of rounds, etc.) is displayed
         *
         * It is created only if the display mode requires it
         */
        that.total = null;
    }

    /**
     * ### generalInit
     *
     * Adds three divs: a container with a nested title and content div
     *
     * Adds references to the instance: displayDiv, titleDiv, contentDiv.
     *
     * @param {object} The instance to which the references are added.
     * @param {string} The name of the container div
     */
    function generalInit(that, containerName, title) {
        that.displayDiv = W.get('div', { className: containerName });
        that.titleDiv = W.add('div', that.displayDiv, {
            className: 'title',
            innerHTML: title
        });
        that.contentDiv = W.add('div', that.displayDiv, {
            className: 'content'
        });
        that.current = W.append('span', that.contentDiv, {
            className: 'number'
        });
        if (that.options.toTotal) {
            that.textDiv = W.append('span', that.contentDiv, {
                className: 'text',
                innerHTML: that.visualRound.separator
            });
            that.total = W.append('span', that.contentDiv, {
                className: 'number'
            });
        }
        that.updateDisplay();
    }

})(node);
