/**
 * # VisualRound widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display information about rounds and/or stage in the game.
 * Accepts different visualization options (e.g. countdown, etc.).
 * See `VisualRound` constructor for a list of all available options.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualRound', VisualRound);

    var J = node.JSUS;

    // ## Meta-data

    VisualRound.version = '0.2.0';
    VisualRound.description = 'Display number of current round and/or stage.' +
        'Can also display countdown and total number of rounds and/or stages.';

    VisualRound.title = 'Round and Stage info';
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
     *
     * @param {object} options The options taken.
     *
     * The options it can take are:
     *
     * - `stageOffset`: Stage displayed is the actual stage minus stageOffset.
     * - `flexibleMode`: Set `true`, if number of rounds and/or stages can
     *     change dynamically.
     * - `curStage`: When (re)starting in `flexibleMode`, sets the current stage
     * - `curRound`: When (re)starting in `flexibleMode`, sets the current round
     * - `totStage`: When (re)starting in `flexibleMode`, sets the total
     *     number of stages.
     * - `totRound`: When (re)starting in `flexibleMode`, sets the total
     *     number of rounds.
     * - `oldStageId`: When (re)starting in `flexibleMode`, sets the id of
     *     the current stage.
     * - `style`: Array of strings. Determines the display style of the widget.
     *
     * @see VisualRound.setStyle
     * @see GameStager
     * @see GamePlot
     */
    function VisualRound(options) {
        this.options = options;

        /**
         * ### VisualRound.strategy
         *
         * Flag that determines what information is displayed
         *
         * Set through `VisualRound.setStyle` using a string to describe
         * the strategy.
         *
         * @see VisualRound.setStyle
         */
        this.strategy = null;

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
         * ### VisualRound.oldStageId
         *
         * Stage id of the previous stage
         *
         * Needed in `flexibleMode` to count rounds.
         */
        this.oldStageId = null;

        this.init(this.options);
    }

    /**
     * ## VisualRound.init
     *
     * Initializes the instance 
     *
     * If called on running instance, options are mixed-in into current
     * settings. See `VisualRound` constructor for which options are allowed.
     *
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound constructor
     */
    VisualRound.prototype.init = function(options) {
        options = options || {};

        J.mixout(options, this.options);
        this.options = options;

        this.stageOffset = this.options.stageOffset || 0;

        if (this.options.flexibleMode) {
            this.curStage = this.options.curStage || 1;
            this.curStage -= this.options.stageOffset || 0;
            this.curRound = this.options.curRound || 1;
            this.totStage = this.options.totStage;
            this.totRound = this.options.totRound;
            this.oldStageId = this.options.oldStageId;
        }

        if (!this.gamePlot) {
            this.gamePlot = node.game.plot;
        }

        if (!this.stager) {
            this.stager = this.gamePlot.stager;
        }

        this.updateInformation();

        if (!this.options.style) {
            this.initStyle(['COUNT_UP_ROUNDS_TO_TOTAL',
                'COUNT_UP_STAGES_TO_TOTAL']);
        }
        else {
            this.initStyle(this.options.style);
        }

        this.updateDisplay();
    };

     VisualRound.prototype.append = function() {
        this.activate(this.strategy);
        this.updateDisplay();
    };

    /**
     * ## VisualRound.updateDisplay
     *
     * Updates the values displayed by forwarding the call to the strategy obj
     *
     * @see VisualRound.strategy
     */
    VisualRound.prototype.updateDisplay = function() {
        if (this.strategy) {
            this.strategy.updateDisplay();
        }
    };

    /**
     * ## VisualRound.initStyle
     *
     * Sets the `VisualRound.strategy` value
     *
     * Multiple strategies are allowed, and will be merged together into a 
     * `CombinedStrategy` object.
     *
     * @param {array} styleNames Array of strings representing the names.
     *
     * @see VisualRound.strategy
     * @see CombinedStrategy
     */
    VisualRound.prototype.initStyle = function(styleNames) {
        var index, style, strategies;

        // Build compound name.
        style = '';
        for (index in styleNames) {
            style += styleNames[index] + '&';
        }
        style = style.substr(0, style.length -1);

        strategies = [];
        for (index in styleNames) {
            switch (styleNames[index]) {
                case 'COUNT_UP_STAGES_TO_TOTAL':
                    strategies.push(new CountUpStages(this, {toTotal: true}));
                    break;
                case 'COUNT_UP_STAGES':
                    strategies.push(new CountUpStages(this));
                    break;
                case 'COUNT_DOWN_STAGES':
                    strategies.push(new CountDownStages(this));
                    break;
                case 'COUNT_UP_ROUNDS_TO_TOTAL':
                    strategies.push(new CountUpRounds(this, {toTotal: true}));
                    break;
                case 'COUNT_UP_ROUNDS':
                    strategies.push(new CountUpRounds(this));
                    break;
                case 'COUNT_DOWN_ROUNDS':
                    strategies.push(new CountDownRounds(this));
                    break;
            }
        }
        this.strategy = new CombinedStrategy(this, strategies);
    };

    /**
     * ## VisualRound.setStyle
     *
     * TODO: merge with initStyle
     * 
     * If and only if styleNames does not define the same strategy as
     * `this.strategy`, this function deactivates `this.strategy`,
     * reassignes `this.strategy` to a `CombinedStrategy` based on the
     * array of style names provided and activates this new strategy.
     * 
     * The following strings are valid options for the style option:
     *
     * - `COUNT_UP_STAGES`: Display only current stage number.
     * - `COUNT_UP_ROUNDS`: Display only current round number.
     * - `COUNT_UP_STAGES_TO_TOTAL`: Display current and total stage number.
     * - `COUNT_UP_ROUNDS_TO_TOTAL`: Display current and total round number.
     * - `COUNT_DOWN_STAGES`: Display number of stages left to play.
     * - `COUNT_DOWN_ROUNDS: Display number of rounds left in this stage.
     *
     * @param {array} styleNames Array of strings representing the names.
     *
     * @see VisualRound.init
     */
    VisualRound.prototype.setStyle = function(styleNames) {
        var index, style, strategies;

        style = '';
        for (index in styleNames) {
            style += styleNames[index] + '&';
        }
        style = style.substr(0,style.length -1);

        if (style !== this.strategy.name) {
            this.deactivate(this.strategy);
            this.initStyle(styleNames);
            this.activate(this.strategy);
        }
    };

    /**
     * ## VisualRound.getStyle
     *
     * Returns name of current style
     *
     * @return {string} Name of current style.
     */
    VisualRound.prototype.getStyle = function() {
        return this.strategy.name;
    };

    /**
     * ## VisualRound.activate
     *
     * Appends the displayDiv of the given strategy to `this.bodyDiv`
     *
     * Calls strategy.activate`, if one is defined.
     *
     * @param {object} strategy Strategy to activate.
     *
     * @see VisualRound.deactivate
     */
    VisualRound.prototype.activate = function(strategy) {
        this.bodyDiv.appendChild(strategy.displayDiv);
        if (strategy.activate) {
            strategy.activate();
        }
    };

    /**
     * ## VisualRound.deactivate
     *
     * Removes the displayDiv of the given strategy from `this.bodyDiv`
     *
     * Calls `strategy.deactivate` if it is defined.
     *
     * @param {object} strategy Strategy to deactivate.
     *
     * @see VisualRound.activate
     */
    VisualRound.prototype.deactivate = function(strategy) {
        this.bodyDiv.removeChild(strategy.displayDiv);
        if (strategy.deactivate) {
            strategy.deactivate();
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
     * ## VisualRound.updateInformation
     *
     * Updates information about rounds and stages and updates the display
     *
     * Updates curRound, curStage, totRound, totStage, oldStageId and calls
     * `VisualRound.updateDisplay`.
     *
     * @see VisualRound.updateDisplay
     */
    VisualRound.prototype.updateInformation = function() {
        var idseq, stage;
        stage = this.gamePlot.getStage(node.player.stage);

        // Flexible mode
        if (this.options.flexibleMode) {
            if (stage) {
                if (stage.id === this.oldStageId) {
                    this.curRound += 1;
                }
                else if (stage.id) {
                    this.curRound = 1;
                    this.curStage += 1;
                }
                this.oldStageId = stage.id;
            }
        }

        // Normal mode.
        else {
            // Extracts only id attribute from array of objects.
            idseq = this.stager.sequence.map(function(obj){return obj.id;});

            // Every round has an identifier.
            this.totStage = idseq.filter(function(obj){return obj;}).length;
            this.curRound = node.player.stage.round;

            if (stage) {
                this.curStage = idseq.indexOf(stage.id)+1;
                this.totRound = this.stager.sequence[this.curStage -1].num || 1;
            }
            else {
                this.curStage = 1;
                this.totRound = 1;
            }
            this.totStage -= this.stageOffset;
            this.curStage -= this.stageOffset;
        }
        this.updateDisplay();
    };

   /**
     * # EmptyStrategy Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays nothing.
     *
     * ---
     */

    /**
     * ## EmptyStrategy
     *
     * Display a strategy which contains the bare minumum (nothing)
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {object} options The options taken.
     *
     * @see VisualRound
     */
    function EmptyStrategy(visualRound, options) {

        /**
         * ### EmptyStrategy.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = 'EMPTY';
        this.options = options || {};

        /**
         * ### EmptyStrategy.visualRound
         *
         * The `VisualRound` object to which the strategy belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### EmptyStrategy.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        this.init(this.options);
    }

    /**
     * ## EmptyStrategy.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken
     *
     * @see EmptyStrategy.updateDisplay
     */
    EmptyStrategy.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.updateDisplay();
    };

    /**
     * ## EmptyStrategy.updateDisplay
     *
     * Does nothing
     *
     * @see VisualRound.updateDisplay
     */
    EmptyStrategy.prototype.updateDisplay = function() {};

    /**
     * # CountUpStages Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays the current
     * and, possibly, the total number of stages.
     * ---
     */

    /**
     * ## CountUpStages
     *
     * Display strategy which displays the current and possibly the total
     * number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {object} options The options taken. If `options.toTotal == true`,
     *     then the total number of stages is displayed.
     *
     * @see VisualRound
     */
    function CountUpStages(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpStages.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = 'COUNT_UP_STAGES';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * ### CountUpStages.visualRound
         *
         * The `VisualRound` object to which the strategy belongs
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

    /**
     * ## CountUpStages.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken. If `options.toTotal == true`,
     *     then the total number of stages is displayed.
     *
     * @see CountUpStages.updateDisplay
     */
    CountUpStages.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'stagediv';

        this.titleDiv = node.window.addElement('div',this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Stage:';

        if (this.options.toTotal) {
            this.curStageNumber = node.window.addElement('span',this.displayDiv);
            this.curStageNumber.className = 'number';
        }
        else {
            this.curStageNumber = node.window.addDiv(this.displayDiv);
            this.curStageNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span',this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totStageNumber = node.window.addElement('span',this.displayDiv);
            this.totStageNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ## CountUpStages.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber` according
     * to `visualRound`
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
     * # CountDownStages Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays the remaining
     * number of stages.
     *
     * ---
     */

    /**
     * ## CountDownStages
     *
     * Display strategy which displays the remaining number of stages
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {object} options The options taken.
     *
     * @see VisualRound
     */
    function CountDownStages(visualRound, options) {

        /**
         * ### CountDownStages.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = 'COUNT_DOWN_STAGES';
        this.options = options || {};

        /**
         * ### CountDownStages.visualRound
         *
         * The `VisualRound` object to which the strategy belongs
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

    /**
     * ## CountDownStages.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken.
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
     * ## CountDownStages.updateDisplay
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
     * # CountUpRounds Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays the current
     * and possibly the total number of rounds.
     *
     * ---
     */

    /**
     * ## CountUpRounds
     *
     * Display strategy which displays the current and possibly the total
     * number of rounds
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {object} options The options taken. If `options.toTotal == true`,
     *     then the total number of rounds is displayed.
     *
     * @see VisualRound
     */
    function CountUpRounds(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpRounds.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = 'COUNT_UP_ROUNDS';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * CountUpRounds.visualRound
         *
         * The `VisualRound` object to which the strategy belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * CountUpRounds.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * CountUpRounds.curRoundNumber
         *
         * The span in which the current round number is displayed
         */
        this.curRoundNumber = null;

        /**
         * CountUpRounds.totRoundNumber
         *
         * The element in which the total round number is displayed
         */
        this.totRoundNumber = null;

        /**
         * CountUpRounds.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        /**
         * CountUpRounds.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        this.init(this.options);
    }

    /**
     * ## CountUpRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken. If `options.toTotal == true`,
     *     then the total number of rounds is displayed.
     *
     * @see CountUpRounds.updateDisplay
     */
    CountUpRounds.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.titleDiv = node.window.addElement('div',this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Round:';

        if (this.options.toTotal) {
            this.curRoundNumber = node.window.addElement('span',this.displayDiv);
            this.curRoundNumber.className = 'number';
        }
        else {
            this.curRoundNumber = node.window.addDiv(this.displayDiv);
            this.curRoundNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span',this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totRoundNumber = node.window.addElement('span',this.displayDiv);
            this.totRoundNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ## CountUpRounds.updateDisplay
     *
     * Updates the content of `curRoundNumber` and `totRoundNumber` according
     * to `visualRound`
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
     * # CountDownRounds Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays the remaining
     * number of rounds.
     *
     * ---
     */

    /**
     * ## CountDownRounds
     *
     * Display strategy which displays the remaining number of rounds.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {object} options The options taken.
     *
     * @see VisualRound
     */
    function CountDownRounds(visualRound, options) {

        /**
         * ### CountDownRounds.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = 'COUNT_DOWN_ROUNDS';
        this.options = options || {};

        /**
         * ### CountDownRounds.visualRound
         *
         * The `VisualRound` object to which the strategy belongs
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

    /**
     * ## CountDownRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken.
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
     * ## CountDownRounds.updateDisplay
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
     * # CombinedStrategy Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Defines a strategy for the `VisualRound` which displays the information
     * according to multiple strategies.
     *
     * ---
     */

    /**
     * ## CombinedStrategy
     *
     * Display strategy which combines multiple other display strategies
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *     strategy belongs
     * @param {array} strategies Array of strategies to be used in combination.
     * @param {object} options The options taken.
     *
     * @see VisualRound
     */
    function CombinedStrategy(visualRound, strategies, options) {
        var index;

        /**
         * ### CombinedStrategy.name
         *
         * The name of the strategy also refered to as the name of the style
         */
        this.name = '';

        for (index in strategies) {
            this.name += strategies[index].name + '&';
        }

        this.name = this.name.substr(0,this.name.length -1);

        this.options = options || {};

        /**
         * ### CombinedStrategy.visualRound
         *
         * The `VisualRound` object to which the strategy belongs.
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

         /**
         * ### CombinedStrategy.strategies
         *
         * The array of strategies to be used in combination.
         */
        this.strategies = strategies;

        /**
         * ### CombinedStrategy.displayDiv
         *
         * The DIV in which the information is displayed.
         */
        this.displayDiv = null;

        this.init(options);
    }

    /**
     * ## CombinedStrategy.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken.
     *
     * @see CombinedStrategy.updateDisplay
     */
     CombinedStrategy.prototype.init = function(options) {
        var index;
        this.displayDiv = node.window.getDiv();

        for (index in this.strategies) {
            this.displayDiv.appendChild(this.strategies[index].displayDiv);
        }

        this.updateDisplay();
     };

    /**
     * ## CombinedStrategy.updateDisplay
     *
     * Calls `updateDisplay` for all strategies in the combination
     *
     * @see VisualRound.updateDisplay
     */
    CombinedStrategy.prototype.updateDisplay = function() {
        var index;
        for (index in this.strategies) {
            this.strategies[index].updateDisplay();
        }
    };

})(node);