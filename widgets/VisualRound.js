/**
 * # VisualRound
 * Copyright(c) 2016 Stefano Balietti
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

    var J = node.JSUS;

    node.widgets.register('VisualRound', VisualRound);

    // ## Meta-data

    VisualRound.version = '0.7.0';
    VisualRound.description = 'Display number of current round and/or stage.' +
        'Can also display countdown and total number of rounds and/or stages.';

    VisualRound.title = 'Round info';
    VisualRound.className = 'visualround';

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
         * Set through `VisualRound.setDisplayMode` using a string to describe
         * the displayMode.
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
     *   - `displayModeNames`:
     *     Array of strings which determines the display style of the widget
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
            this.curRound = this.options.curRound || 1;
            this.totStage = this.options.totStage;
            this.totRound = this.options.totRound;
            this.oldStageId = this.options.oldStageId;
        }

        // Save references to gamePlot and stager for convenience.
        if (!this.gamePlot) this.gamePlot = node.game.plot;
        if (!this.stager) this.stager = this.gamePlot.stager;

        this.updateInformation();

        if (!this.options.displayModeNames) {
            this.setDisplayMode(['COUNT_UP_ROUNDS_TO_TOTAL',
                'COUNT_UP_STAGES_TO_TOTAL']);
        }
        else {
            this.setDisplayMode(this.options.displayModeNames);
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
        if (this.displayMode) {
            this.displayMode.updateDisplay();
        }
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
     * - `COUNT_UP_ROUNDS`: Display only current round number.
     * - `COUNT_UP_STAGES_TO_TOTAL`: Display current and total stage number.
     * - `COUNT_UP_ROUNDS_TO_TOTAL`: Display current and total round number.
     * - `COUNT_DOWN_STAGES`: Display number of stages left to play.
     * - `COUNT_DOWN_ROUNDS`: Display number of rounds left in this stage.
     *
     * @param {array} displayModeNames Array of strings representing the names
     *
     * @see VisualRound.displayMode
     * @see CompoundDisplayMode
     * @see VisualRound.init
     */
    VisualRound.prototype.setDisplayMode = function(displayModeNames) {
        var index, compoundDisplayModeName, displayModes;

        // Validation of input parameter.
        if (!J.isArray(displayModeNames)) {
            throw TypeError;
        }

        // Build compound name.
        compoundDisplayModeName = '';
        for (index in displayModeNames) {
            if (displayModeNames.hasOwnProperty(index)) {
                compoundDisplayModeName += displayModeNames[index] + '&';
            }
        }

        // Remove trailing '&'.
        compoundDisplayModeName = compoundDisplayModeName.substr(0,
            compoundDisplayModeName, compoundDisplayModeName.length -1);

        if (this.displayMode) {
            if (compoundDisplayModeName !== this.displayMode.name) {
                this.deactivate(this.displayMode);
            }
            else {
                return;
            }
        }

        // Build `CompoundDisplayMode`.
        displayModes = [];
        for (index in displayModeNames) {
            if (displayModeNames.hasOwnProperty(index)) {
                switch (displayModeNames[index]) {
                    case 'COUNT_UP_STAGES_TO_TOTAL':
                        displayModes.push(new CountUpStages(this,
                            {toTotal: true}));
                        break;
                    case 'COUNT_UP_STAGES':
                        displayModes.push(new CountUpStages(this));
                        break;
                    case 'COUNT_DOWN_STAGES':
                        displayModes.push(new CountDownStages(this));
                        break;
                    case 'COUNT_UP_ROUNDS_TO_TOTAL':
                        displayModes.push(new CountUpRounds(this,
                            {toTotal: true}));
                        break;
                    case 'COUNT_UP_ROUNDS':
                        displayModes.push(new CountUpRounds(this));
                        break;
                    case 'COUNT_DOWN_ROUNDS':
                        displayModes.push(new CountDownRounds(this));
                        break;
                }
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
        if (this.bodyDiv) {
            this.bodyDiv.appendChild(displayMode.displayDiv);
        }
        if (displayMode.activate) {
            displayMode.activate();
        }
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
        if (displayMode.deactivate) {
            displayMode.deactivate();
        }
    };

    VisualRound.prototype.listeners = function() {
        var that = this;

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
        var stage, len;

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

            this.curStage = stage.stage;
            // Stage can be indexed by id or number in the sequence.
            if ('string' === typeof this.curStage) {
                this.curStage =
                    this.gamePlot.normalizeGameStage(stage).stage;
            }
            this.curRound = stage.round;
            this.totRound = this.stager.sequence[this.curStage -1].num || 1;
            this.curStage -= this.stageOffset;
            len = this.stager.sequence.length;
            this.totStage = len - this.totStageOffset;
            if (this.stager.sequence[(len-1)].type === 'gameover') {
                this.totStage--;
            }
        }
        // Update display.
        this.updateDisplay();
    };

   /**
     * # EmptyDisplayMode
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays nothing
     */

    /**
     * ## EmptyDisplayMode constructor
     *
     * Display a displayMode which contains the bare minumum (nothing)
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function EmptyDisplayMode(visualRound, options) {

        /**
         * ### EmptyDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = 'EMPTY';
        this.options = options || {};

        /**
         * ### EmptyDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### EmptyDisplayMode.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        this.init(this.options);
    }

    // ## EmptyDisplayMode methods

    /**
     * ### EmptyDisplayMode.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken
     *
     * @see EmptyDisplayMode.updateDisplay
     */
    EmptyDisplayMode.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.updateDisplay();
    };

    /**
     * ### EmptyDisplayMode.updateDisplay
     *
     * Does nothing
     *
     * @see VisualRound.updateDisplay
     */
    EmptyDisplayMode.prototype.updateDisplay = function() {};

    /**
     * # CountUpStages
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the current
     * and, possibly, the total number of stages
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
     *
     * @see VisualRound
     */
    function CountUpStages(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpStages.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_UP_STAGES';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * ### CountUpStages.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountUpStages.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountUpStages.curStageNumber
         *
         * The span in which the current stage number is displayed
         */
        this.curStageNumber = null;

        /**
         * ### CountUpStages.totStageNumber
         *
         * The element in which the total stage number is displayed
         */
        this.totStageNumber = null;

        /**
         * ### CountUpStages.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        /**
         * ### CountUpStages.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        this.init(this.options);
    }

    // ## CountUpStages methods

    /**
     * ### CountUpStages.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of stages is displayed
     *
     * @see CountUpStages.updateDisplay
     */
    CountUpStages.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'stagediv';

        this.titleDiv = node.window.addElement('div', this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Stage:';

        if (this.options.toTotal) {
            this.curStageNumber = node.window.addElement('span',
                this.displayDiv);
            this.curStageNumber.className = 'number';
        }
        else {
            this.curStageNumber = node.window.addDiv(this.displayDiv);
            this.curStageNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span', this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totStageNumber = node.window.addElement('span',
                this.displayDiv);
            this.totStageNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ### CountUpStages.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     *
     * @see VisualRound.updateDisplay
     */
    CountUpStages.prototype.updateDisplay = function() {
        this.curStageNumber.innerHTML = this.visualRound.curStage;
        if (this.options.toTotal) {
            this.totStageNumber.innerHTML = this.visualRound.totStage || '?';
        }
    };

   /**
     * # CountDownStages
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
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
     *
     * @see VisualRound
     */
    function CountDownStages(visualRound, options) {

        /**
         * ### CountDownStages.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_DOWN_STAGES';
        this.options = options || {};

        /**
         * ### CountDownStages.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountDownStages.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountDownStages.stagesLeft
         *
         * The DIV in which the number stages left is displayed
         */
        this.stagesLeft = null;

        /**
         * ### CountDownStages.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        this.init(this.options);
    }

    // ## CountDownStages methods

    /**
     * ### CountDownStages.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CountDownStages.updateDisplay
     */
    CountDownStages.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'stagediv';

        this.titleDiv = node.window.addDiv(this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Stages left: ';

        this.stagesLeft = node.window.addDiv(this.displayDiv);
        this.stagesLeft.className = 'number';

        this.updateDisplay();
    };

    /**
     * ### CountDownStages.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     *
     * @see VisualRound.updateDisplay
     */
    CountDownStages.prototype.updateDisplay = function() {
        if (this.visualRound.totStage === this.visualRound.curStage) {
            this.stagesLeft.innerHTML = 0;
            return;
        }
        this.stagesLeft.innerHTML =
                (this.visualRound.totStage - this.visualRound.curStage) || '?';
    };

   /**
     * # CountUpRounds
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the current
     * and possibly the total number of rounds
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
     *
     * @see VisualRound
     */
    function CountUpRounds(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpRounds.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_UP_ROUNDS';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * ### CountUpRounds.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountUpRounds.curRoundNumber
         *
         * The span in which the current round number is displayed
         */
        this.curRoundNumber = null;

        /**
         * ### CountUpRounds.totRoundNumber
         *
         * The element in which the total round number is displayed
         */
        this.totRoundNumber = null;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        this.init(this.options);
    }

    // ## CountUpRounds methods

    /**
     * ### CountUpRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of rounds is displayed
     *
     * @see CountUpRounds.updateDisplay
     */
    CountUpRounds.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.titleDiv = node.window.addElement('div', this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Round:';

        if (this.options.toTotal) {
            this.curRoundNumber = node.window.addElement('span',
                this.displayDiv);
            this.curRoundNumber.className = 'number';
        }
        else {
            this.curRoundNumber = node.window.addDiv(this.displayDiv);
            this.curRoundNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span', this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totRoundNumber = node.window.addElement('span',
                this.displayDiv);
            this.totRoundNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ### CountUpRounds.updateDisplay
     *
     * Updates the content of `curRoundNumber` and `totRoundNumber`
     *
     * Values are updated according to the state of `visualRound`.
     *
     * @see VisualRound.updateDisplay
     */
    CountUpRounds.prototype.updateDisplay = function() {
        this.curRoundNumber.innerHTML = this.visualRound.curRound;
        if (this.options.toTotal) {
            this.totRoundNumber.innerHTML = this.visualRound.totRound || '?';
        }
    };


   /**
     * # CountDownRounds
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the remaining
     * number of rounds
     */

    /**
     * ## CountDownRounds constructor
     *
     * Display mode which displays the remaining number of rounds
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function CountDownRounds(visualRound, options) {

        /**
         * ### CountDownRounds.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_DOWN_ROUNDS';
        this.options = options || {};

        /**
         * ### CountDownRounds.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountDownRounds.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountDownRounds.roundsLeft
         *
         * The DIV in which the number rounds left is displayed
         */
        this.roundsLeft = null;

        /**
         * ### CountDownRounds.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        this.init(this.options);
    }

    // ## CountDownRounds methods

    /**
     * ### CountDownRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CountDownRounds.updateDisplay
     */
    CountDownRounds.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.titleDiv = node.window.addDiv(this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Round left: ';

        this.roundsLeft = node.window.addDiv(this.displayDiv);
        this.roundsLeft.className = 'number';

        this.updateDisplay();
    };

    /**
     * ### CountDownRounds.updateDisplay
     *
     * Updates the content of `roundsLeft` according to `visualRound`
     *
     * @see VisualRound.updateDisplay
     */
    CountDownRounds.prototype.updateDisplay = function() {
        if (this.visualRound.totRound === this.visualRound.curRound) {
            this.roundsLeft.innerHTML = 0;
            return;
        }
        this.roundsLeft.innerHTML =
                (this.visualRound.totRound - this.visualRound.curRound) || '?';
    };

    /**
     * # CompoundDisplayMode
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the
     * information according to multiple displayModes
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
     *
     * @see VisualRound
     */
    function CompoundDisplayMode(visualRound, displayModes, options) {
        var index;

        /**
         * ### CompoundDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = '';

        for (index in displayModes) {
            if (displayModes.hasOwnProperty(index)) {
                this.name += displayModes[index].name + '&';
            }
        }

        this.name = this.name.substr(0, this.name.length -1);

        this.options = options || {};

        /**
         * ### CompoundDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

         /**
         * ### CompoundDisplayMode.displayModes
         *
         * The array of displayModes to be used in combination
         */
        this.displayModes = displayModes;

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
     CompoundDisplayMode.prototype.init = function(options) {
        var index;
        this.displayDiv = node.window.getDiv();

        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                this.displayDiv.appendChild(
                    this.displayModes[index].displayDiv);
            }
        }

        this.updateDisplay();
     };

    /**
     * ### CompoundDisplayMode.updateDisplay
     *
     * Calls `updateDisplay` for all displayModes in the combination
     *
     * @see VisualRound.updateDisplay
     */
    CompoundDisplayMode.prototype.updateDisplay = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                this.displayModes[index].updateDisplay();
            }
        }
    };

    CompoundDisplayMode.prototype.activate = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                if (this.displayModes[index].activate) {
                    this.displayModes[index].activate();
                }
            }
        }
    };

    CompoundDisplayMode.prototype.deactivate = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                if (this.displayModes[index].deactivate) {
                    this.displayMode[index].deactivate();
                }
            }
        }
    };

})(node);
