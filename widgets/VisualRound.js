/**
 * # VisualRound
 * Copyright(c) 2017 Stefano Balietti
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

    VisualRound.version = '0.7.2';
    VisualRound.description = 'Display number of current round and/or stage.' +
        'Can also display countdown and total number of rounds and/or stages.';

    VisualRound.title = 'Round info';
    VisualRound.className = 'visualround';

    VisualRound.texts.round = 'Round';
    VisualRound.texts.stage = 'Stage';
    VisualRound.texts.roundLeft = 'Round Left';
    VisualRound.texts.stageLeft = 'Stage left';

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
            this.setDisplayMode([
                'COUNT_UP_ROUNDS_TO_TOTAL',
                'COUNT_UP_STAGES_TO_TOTAL'
            ]);
        }
        else {
            this.setDisplayMode(this.options.displayModeNames);
        }

        if ('undefined' !== typeof options.separator) {
            this.separator = options.separator;
        }

        if ('undefined' !== typeof options.layout) {
            this.layout = options.layout;
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
        var i, len, compoundDisplayModeName, displayModes;

        // Validation of input parameter.
        if (!J.isArray(displayModeNames)) {
            throw new TypeError('VisualRound.setDisplayMode: ' +
                                'displayModeNames must be an array. Found: ' +
                                displayModeNames);
        }
        len = displayModeNames.length;
        if (len === 0) {
            throw new Error('VisualRound.setDisplayMode: ' +
                            'displayModeNames is empty.');
        }

        if (this.displayMode) {
            // Build compound name.
            compoundDisplayModeName = displayModeNames.join('&');
            // Nothing to do if mode is already active.
            if (compoundDisplayModeName === this.displayMode.name) return;
            this.deactivate(this.displayMode);
        }

        i = -1;
        for (; ++i < len; ) {
            compoundDisplayModeName += displayModeNames[i];
            if (i !== (len-1)) compoundDisplayModeName += '&';
        }


        // Build `CompoundDisplayMode`.
        displayModes = [];
        i = -1;
        for (; ++i < len; ) {
            switch (displayModeNames[i]) {
            case 'COUNT_UP_STAGES_TO_TOTAL':
                displayModes.push(new CountUpStages(this, { toTotal: true }));
                break;
            case 'COUNT_UP_STAGES':
                displayModes.push(new CountUpStages(this));
                break;
            case 'COUNT_DOWN_STAGES':
                displayModes.push(new CountDownStages(this));
                break;
            case 'COUNT_UP_ROUNDS_TO_TOTAL':
                displayModes.push(new CountUpRounds(this, { toTotal: true }));
                break;
            case 'COUNT_UP_ROUNDS':
                displayModes.push(new CountUpRounds(this));
                break;
            case 'COUNT_DOWN_ROUNDS':
                displayModes.push(new CountDownRounds(this));
                break;
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
     * ### VisualRound.setLayout
     *
     * Arranges the relative position of the various elements of VisualRound
     *
     * @param {string} layout. Admitted values:
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
     * Copyright(c) 2017 Stefano Balietti
     * MIT Licensed
     *
     * Display mode for `VisualRound` which with current/total number of stages
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

        generalConstructor(this, visualRound, 'COUNT_UP_STAGES', options);

        /**
         * ### CountUpStages.curStageNumber
         *
         * The span in which the current stage number is displayed
         */
        this.curStageNumber = null;

        /**
         * ### CountUpStages.totStageNumber
         *
         * The span in which the total stage number is displayed
         */
        this.totStageNumber = null;

        /**
         * ### CountUpStages.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        // Inits it!
        this.init();
    }

    // ## CountUpStages methods

    /**
     * ### CountUpStages.init
     *
     * Initializes the instance
     *
     * @see CountUpStages.updateDisplay
     */
    CountUpStages.prototype.init = function() {
        generalInit(this, 'stagediv', this.visualRound.getText('stage'));

        this.curStageNumber = W.append('span', this.contentDiv, {
            className: 'number'
        });
        if (this.options.toTotal) {
            this.textDiv = W.append('span', this.contentDiv, {
                className: 'text',
                innerHTML: this.visualRound.separator
            });
            this.totStageNumber = W.append('span', this.contentDiv, {
                className: 'number'
            });
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
     * Copyright(c) 2017 Stefano Balietti
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

        generalConstructor(this, visualRound, 'COUNT_DOWN_STAGES', options);

        /**
         * ### CountDownStages.stagesLeft
         *
         * The DIV in which the number stages left is displayed
         */
        this.stagesLeft = null;

        this.init();
    }

    // ## CountDownStages methods

    /**
     * ### CountDownStages.init
     *
     * Initializes the instance
     *
     * @see CountDownStages.updateDisplay
     */
    CountDownStages.prototype.init = function() {
        generalInit(this, 'stagediv', this.visualRound.getText('stageLeft'));
        this.stagesLeft = W.add('div', this.contentDiv, {
            className: 'number'
        });
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
        var v;
        v = this.visualRound;
        if (v.totStage === v.curStage) {
            this.stagesLeft.innerHTML = 0;
        }
        else {
            this.stagesLeft.innerHTML = (v.totStage - v.curStage) || '?';
        }
    };

   /**
     * # CountUpRounds
     *
     * Copyright(c) 2017 Stefano Balietti
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

        generalConstructor(this, visualRound, 'COUNT_UP_ROUNDS', options);

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

        this.init();
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
    CountUpRounds.prototype.init = function() {

        generalInit(this, 'rounddiv', this.visualRound.getText('round'));

        this.curRoundNumber = W.add('span', this.contentDiv, {
            className: 'number'
        });
        if (this.options.toTotal) {
            this.textDiv = W.add('span', this.contentDiv, {
                className: 'text',
                innerHTML: this.visualRound.separator
            });

            this.totRoundNumber = W.add('span', this.contentDiv,  {
                className: 'number'
            });
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
     * Copyright(c) 2017 Stefano Balietti
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

        generalConstructor(this, visualRound, 'COUNT_DOWN_ROUNDS', options);

        /**
         * ### CountDownRounds.roundsLeft
         *
         * The DIV in which the number rounds left is displayed
         */
        this.roundsLeft = null;

        this.init();
    }

    // ## CountDownRounds methods

    /**
     * ### CountDownRounds.init
     *
     * Initializes the instance
     *
     * @see CountDownRounds.updateDisplay
     */
    CountDownRounds.prototype.init = function() {
        generalInit(this, 'rounddiv', this.visualRound.getText('roundLeft'));

        this.roundsLeft = W.add('div', this.displayDiv);
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
        var v;
        v = this.visualRound;
        if (v.totRound === v.curRound) {
            this.roundsLeft.innerHTML = 0;
        }
        else {
            this.roundsLeft.innerHTML = (v.totRound - v.curRound) || '?';
        }
    };

    /**
     * # CompoundDisplayMode
     *
     * Copyright(c) 2017 Stefano Balietti
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
     CompoundDisplayMode.prototype.init = function(options) {
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
     *
     * @see VisualRound.updateDisplay
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

        /**
         * #### visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
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
        that.options = options || {};

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
         * #### textDiv
         *
         * The span in which the text ` of ` is displayed
         */
        that.textDiv = null;

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
    }

})(node);
