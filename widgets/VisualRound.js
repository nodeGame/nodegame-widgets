(function(node) {
    "use strict";
    // TODO DOCUMENTATION

    node.widgets.register('VisualRound',VisualRound);
    VisualRound.title = 'Stage/Round';
    VisualRound.className = 'visualround';

    var J = node.JSUS;

    VisualRound.dependencies = {
        GamePlot: {},
        JSUS: {}
    };

    function VisualRound(options) {
        this.options = options || {};
        this.strategy = null;

        this.stager = null;
        this.gamePlot = null;
        this.curStage = null;
        this.totStage = null;
        this.curRound = null;
        this.totRound = null;
        this.stageOffset = null;
        this.oldStageId = null; // Only needed for flexibleMode.

        this.init(this.options);
    }

    VisualRound.prototype.init = function(options) {
        if (!options) {
            options = {};
        }

        J.mixout(options, this.options);
        this.options = options;

        this.stageOffset = this.options.stageOffset || 0;

//        this.options.flexibleMode = 1; // TODO Remove debugging statement
        if (this.options.flexibleMode) {
            this.curStage = this.options.curStage || 1;
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
            this.initStyle(['COUNT_UP_ROUNDS_TO_TOTAL','COUNT_DOWN_STAGES']);
//            this.initStyle(['COUNT_UP_STAGES','COUNT_DOWN_STAGES',
//                    'COUNT_UP_STAGES_TO_TOTAL','COUNT_UP_ROUNDS_TO_TOTAL',
//                    'COUNT_UP_ROUNDS','COUNT_DOWN_ROUNDS']);

        }
        else {
            this.initStyle(this.options.style);
        }

        this.updateDisplay();
    };

    VisualRound.prototype.updateDisplay = function() {
        if (this.strategy) {
            this.strategy.updateDisplay();
        }
    };

    // we have no strategy and no bodyDiv
    VisualRound.prototype.initStyle = function(styleNames) {
        var styleNameIndex, style, strategies;

        // Build compound name.
        style = '';
        for (styleNameIndex in styleNames) {
            style += styleNames[styleNameIndex] + '&';
        }
        style = style.substr(0,style.length -1);

        strategies = [];
        for (styleNameIndex in styleNames) {
            switch (styleNames[styleNameIndex]) {
                case 'COUNT_UP_STAGES_TO_TOTAL':
                    strategies.push(new CountUpStages(this,{toTotal: true}));
                    break;
                case 'COUNT_UP_STAGES':
                    strategies.push(new CountUpStages(this));
                    break;
                case 'COUNT_DOWN_STAGES':
                    strategies.push(new CountDownStages(this));
                    break;
                case 'COUNT_UP_ROUNDS_TO_TOTAL':
                    strategies.push(new CountUpRounds(this,{toTotal: true}));
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

    VisualRound.prototype.append = function() {
        this.activate(this.strategy);
        this.updateDisplay();
    };

    // sets a strategy according to Style (translate between strategies and styles)
    VisualRound.prototype.setStyle = function(styleNames) {
        var styleNameIndex, style, strategies;

        style = '';
        for (styleNameIndex in styleNames) {
            style += styleNames[styleNameIndex] + '&';
        }
        style = style.substr(0,style.length -1);

        if (style !== this.strategy.name) {
            this.deactivate(this.strategy);
            this.initStyle(styleNames);
            this.activate(this.strategy);
        }
    };

    VisualRound.prototype.getStyle = function() {
        return this.strategy.name;
    };


    VisualRound.prototype.activate = function(strategy) {
        this.bodyDiv.appendChild(strategy.displayDiv);
        if (strategy.activate) {
            strategy.activate();
        }
    };

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

        // Game over and init?
    };

    VisualRound.prototype.updateInformation = function() {
        var idseq, stage;

        stage = this.gamePlot.getStage(node.player.stage);
        // Flexible mode
        if (this.options.flexibleMode) {
            if (stage && stage.id === this.oldStageId) {
                this.curRound += 1;
            }
            else if (stage && stage.id) {
                this.curRound = 1;
                this.curStage += 1;
            }
        }

        // For normal mode
        else {
            // Extracts only id attribute from array of objects
            idseq = this.stager.sequence.map(function(obj){return obj.id;});

            // Every round has an identifier
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
        }
        this.totStage -= this.stageOffset;
        this.curStage -= this.stageOffset;
        this.updateDisplay();
        if (stage) {
            this.oldStageId = stage.id;
        }
    };

    function CountUpStages(visualRound, options) {
        this.options = options || {};
        if (this.options.toTotal) {
            this.name = 'COUNT_UP_STAGES_TO_TOTAL';
        }
        else {
            this.name = 'COUNT_UP_STAGES';
        }
        this.visualRound = visualRound;
        this.displayDiv = null;
        this.curStageNumber = null;
        this.totStageNumber = null;
        this.titleDiv = null;
        this.textDiv = null;

        this.init(this.options);
    }

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

    CountUpStages.prototype.updateDisplay = function() {
        this.curStageNumber.innerHTML = this.visualRound.curStage;
        if (this.options.toTotal) {
            this.totStageNumber.innerHTML = this.visualRound.totStage || '?';
        }
    };

    function CountDownStages(visualRound, options) {
        this.name = 'COUNT_DOWN_STAGES';
        this.options = options || {};
        this.visualRound = visualRound;
        this.displayDiv = null;
        this.stagesLeft = null;
        this.titleDiv = null;

        this.init(this.options);
    }

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

    CountDownStages.prototype.updateDisplay = function() {
        if (this.visualRound.totStage === this.visualRound.curStage) {
            this.stagesLeft.innerHTML = 0;
            return;
        }
        this.stagesLeft.innerHTML =
                (this.visualRound.totStage - this.visualRound.curStage) || '?';
    };

    function CountUpRounds(visualRound, options) {
    this.options = options || {};
        if (this.options.toTotal) {
            this.name = 'COUNT_UP_ROUNDS_TO_TOTAL';
        }
        else {
            this.name = 'COUNT_UP_ROUNDS';
        }
        this.visualRound = visualRound;
        this.displayDiv = null;
        this.curRoundNumber = null;
        this.totRoundNumber = null;
        this.textDiv = null;

        this.init(this.options);
    }

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

    CountUpRounds.prototype.updateDisplay = function() {
        this.curRoundNumber.innerHTML = this.visualRound.curRound;
        if (this.options.toTotal) {
            this.totRoundNumber.innerHTML = this.visualRound.totRound || '?';
        }
    };


    function CountDownRounds(visualRound, options) {
        this.name = 'COUNT_DOWN_ROUNDS';
        this.options = options || {};
        this.visualRound = visualRound;
        this.displayDiv = null;
        this.roundsLeft = null;
        this.titleDiv = null;

        this.init(this.options);
    }

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

    CountDownRounds.prototype.updateDisplay = function() {
        if (this.visualRound.totRound === this.visualRound.curRound) {
            this.roundsLeft.innerHTML = 0;
            return;
        }
        this.roundsLeft.innerHTML =
                (this.visualRound.totRound - this.visualRound.curRound) || '?';
    };

    function CombinedStrategy(visualRound, strategies, options) {
        var strategyIndex;
        this.name = '';
        for (strategyIndex in strategies) {
            this.name += strategies[strategyIndex].name + '&';
        }
        this.name = this.name.substr(0,this.name.length -1);

        this.options = options || {};
        this.visualRound = visualRound;
        this.strategies = strategies;

        this.displayDiv = node.window.getDiv();

        for (strategyIndex in strategies) {
            this.displayDiv.appendChild(this.strategies[strategyIndex].displayDiv);
        }
    }

    CombinedStrategy.prototype.updateDisplay = function() {
        var strategyIndex;
        for (strategyIndex in this.strategies) {
            this.strategies[strategyIndex].updateDisplay();
        }
    };

})(node);
