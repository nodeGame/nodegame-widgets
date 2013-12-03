/**
 * # VisualTimer widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Display a timer for the game. Timer can trigger events. 
 * Only for countdown smaller than 1h.'
 * 
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualTimer', VisualTimer);

    var J = node.JSUS;

    // ## Defaults

    VisualTimer.defaults = {};
    VisualTimer.defaults.id = 'visualtimer';
    VisualTimer.defaults.fieldset = {
        legend: 'Time left',
        id: 'visualtimer_fieldset'
    };

    // ## Meta-data

    VisualTimer.version = '0.3.3';
    VisualTimer.description = 'Display a timer for the game. Timer can ' +
        'trigger events. Only for countdown smaller than 1h.';

    // ## Dependencies

    VisualTimer.dependencies = {
        GameTimer : {},
        JSUS: {}
    };

    function VisualTimer(options) {
        this.options = options;
        this.options.update = ('undefined' === typeof this.options.update) ?
            1000 : this.options.update;

        this.id = options.id;

        this.gameTimer = null;
        
        // The DIV in which to display the timer.
        this.timerDiv = null;   
        
        // The parent element.
        this.root = null;

        this.init(this.options);
    }

    VisualTimer.prototype.init = function(options) {
        var t;
        
        J.mixout(options, this.options);

        console.log(options);

        if (options.hooks) {
            if (!options.hooks instanceof Array) {
                options.hooks = [options.hooks];
            }
        }
        else {
            options.hooks = [];
        }

        options.hooks.push({
            hook: this.updateDisplay,
            ctx: this
        });

        if (!this.gameTimer) {
            this.gameTimer = node.timer.createTimer();
        }
        
        this.gameTimer.init(options);

        if (this.timerDiv) {
            this.timerDiv.className = options.className || '';
        }

        t = this.gameTimer;
        node.session.register('visualtimer', {
            set: function(p) {
                // TODO.
            },
            get: function() {
                return {
                    startPaused: t.startPaused,
	            status: t.status,
                    timeLeft: t.timeLeft,
                    timePassed: t.timePassed,
                    update: t.update,
                    updateRemaining: t.updateRemaining,
                    updateStart: t. updateStart
                };
            }
        });
        
        this.options = options;
    };

    VisualTimer.prototype.getRoot = function() {
        return this.root;
    };

    VisualTimer.prototype.append = function(root) {
        this.root = root;
        this.timerDiv = node.window.addDiv(root, this.id + '_div');
        this.updateDisplay();
        return root;
    };

    VisualTimer.prototype.updateDisplay = function() {
        var time, minutes, seconds;
        if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
            this.timerDiv.innerHTML = '00:00';
            return;
        }
        time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
        time = J.parseMilliseconds(time);
        minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
        seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
        this.timerDiv.innerHTML = minutes + ':' + seconds;
    };

    VisualTimer.prototype.start = function() {
        this.updateDisplay();
        console.log(this.gameTimer);
        this.gameTimer.start();
    };

    VisualTimer.prototype.restart = function(options) {
        this.init(options);
        this.start();
    };

    VisualTimer.prototype.stop = function(options) {
        if (!this.gameTimer.isStopped()) {
            this.gameTimer.stop();
        }
    };

    VisualTimer.prototype.resume = function(options) {
        this.gameTimer.resume();
    };

    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.timerDiv.innerHTML = '0:0';
    };

    VisualTimer.prototype.listeners = function() {
        var that = this;
        node.on('PLAYING', function() {
            var stepObj, timer, options;
            stepObj = node.game.getCurrentStep();
            if (!stepObj) return;
            timer = stepObj.timer;
            if (timer) {
                options = processOptions(timer, this.options);
                that.gameTimer.init(timer);
                that.timerDiv.className = '';
                that.start();
            }
        });

        node.on('DONE', function() {
            that.stop();
            that.timerDiv.className = 'strike';
        });

        node.on
    };

    /**
     * ## processOptions
     *
     * Clones and mixes in user options with current options
     *
     * Return object is transformed accordingly.
     *
     * @param {object} Configuration options
     * @return {object} Clean, valid configuration object.
     */
    function processOptions(options, curOptions) {
        var typeoftimer;
        options = J.clone(options);
        J.mixin(options, curOptions);
        typeoftimer = typeof timer;
        switch (typeoftimer) {

        case 'number':
            options.milliseconds = timer;
            break;
        case 'object':
            options = timer;
            break;
        case 'function':
            options.milliseconds = timer;
            break;
        case 'string':
            options.milliseconds = Number(timer);
            break;
        }

        if (!options.milliseconds) {
            throw new Error('VisualTimer processOptions: milliseconds cannot ' +
                            'be 0 or undefined.');
        }

        if ('function' === typeof options.milliseconds) {
            options.milliseconds = options.milliseconds.call(node.game);
        }

        if (!options.timeup) {
            options.timeup = 'DONE';
        }
        return options;
    }

})(node);
