/**
 * # VisualTimer widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display a timer for the game. Timer can trigger events. 
 * Only for countdown smaller than 1h.
 * 
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualTimer', VisualTimer);

    var J = node.JSUS;

    // ## Meta-data

    VisualTimer.version = '0.4.0';
    VisualTimer.description = 'Display a timer for the game. Timer can ' +
        'trigger events. Only for countdown smaller than 1h.';

    VisualTimer.title = 'Time left';
    VisualTimer.className = 'visualtimer';

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
        
        // The DIV in which to display the maximum waiting time left.
        this.waitDiv = null;
        
        this.runDiv = null;
        
        this.timeLeft = null;

        this.init(this.options);
    }

    VisualTimer.prototype.init = function(options) {
        var t;
        
        J.mixout(options, this.options);

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
        
        this.runDiv = this.timerDiv;
        if (this.waitDiv) {
            this.waitDiv.style.display = 'none';
        }
    };

    VisualTimer.prototype.append = function() {
        var titleWaitDiv, timeWaitDiv;
        
        this.timerDiv = node.window.addDiv(this.bodyDiv);
        
        this.waitDiv = node.window.addDiv(this.bodyDiv);
        
        titleWaitDiv = node.window.addDiv(this.bodyDiv);
        titleWaitDiv.innerHTML = 'Max. Wait Time';
        titleWaitDiv.className = 'waitTimerTitle';
        this.waitDiv.appendChild(titleWaitDiv);
        
        timeWaitDiv = node.window.addDiv(this.bodyDiv);
        timeWaitDiv.className = 'waitTimer';
        this.waitDiv.appendChild(timeWaitDiv);
        
        
        this.runDiv = this.timerDiv;
        this.updateDisplay();
    };

    VisualTimer.prototype.updateDisplay = function() {
        var time, minutes, seconds;
        if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
            this.runDiv.innerHTML = '00:00';
            return;
        }
        time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
        time = J.parseMilliseconds(time);
        minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
        seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
        this.runDiv.innerHTML = minutes + ':' + seconds;
    };

    VisualTimer.prototype.start = function() {
        this.timerDiv.className = '';
        this.runDiv = this.timerDiv;
        this.waitDiv.style.display = 'none';
        this.updateDisplay();
        this.gameTimer.start();
    };

    VisualTimer.prototype.restart = function(options) {
        this.init(options);
        this.start();
    };

    VisualTimer.prototype.stop = function(options) {
        if (!this.gameTimer.isStopped()) {
            var waitTime;
            this.timeLeft = this.gameTimer.milliseconds - this.gameTimer.timePassed;
            
            if (typeof options === 'undefined' || typeof options.waitTime === 'undefined') {
                waitTime = this.timeLeft;
            }
            else {
                waitTime = options.waitTime;
            }
            if (waitTime >= 0) {
                this.gameTimer.restart({milliseconds : waitTime});
                this.runDiv = this.waitDiv.children[1];
                this.waitDiv.style.display = '';
            }
            else {
                this.gameTimer.stop();
            }
            this.updateDisplay();
        }
            
    };

    VisualTimer.prototype.resume = function(options) {
        this.gameTimer.resume();
        this.waitDiv.style.display = 'none';
        
    };

    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.waitDiv.style.display = 'none';
        this.timerDiv.innerHTML = '00:00';
    };
    
    VisualTimer.prototype.empty_timer = function(options) {
        this.timerDiv.innerHTML = '';
    }
    /**
     * ## VisualTimer.doTimeUp
     *
     * Stops the timer and calls the timeup
     *
     * It will call timeup even if the game is paused.
     *
     * @see VisualTimer.stop
     * @see GameTimer.fire
     */
    VisualTimer.prototype.doTimeUp = function() {
        this.stop();
        this.gameTimer.timeLeft = 0;
        this.gameTimer.fire(this.gameTimer.timeup);
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
                that.gameTimer.init(options);
                that.start();
            }
        });

        node.on('REALLY_DONE', function() {
            that.stop();
            that.timerDiv.className = 'strike';
       });

    };

    VisualTimer.prototype.destroy = function() {
        node.timer.destroyTimer(this.gameTimer);
        this.bodyDiv.removeChild(this.timerDiv);
    };

    /**
     * ## processOptions
     *
     * Clones and mixes in user options with current options
     *
     * Return object is transformed accordingly.
     *
     * @param {object} options Configuration options
     * @param {object} curOptions Current configuration of VisualTimer
     * @return {object} Clean, valid configuration object.
     */
    function processOptions(inOptions, curOptions) {
        var options, typeofOptions;
        options = {};
        inOptions = J.clone(inOptions);
        typeofOptions = typeof inOptions;
        switch (typeofOptions) {

        case 'number':
            options.milliseconds = inOptions;
            break;
        case 'object':
            options = inOptions;
            if ('function' === typeof options.milliseconds) {
	        options.milliseconds = options.milliseconds.call(node.game);
	    }
            break;
        case 'function':
            options.milliseconds = inOptions.call(node.game);
            break;
        case 'string':
            options.milliseconds = Number(inOptions);
            break;
        }

        J.mixout(options, curOptions || {});

        if (!options.milliseconds) {
            throw new Error('VisualTimer processOptions: milliseconds cannot ' +
                            'be 0 or undefined.');
        }

        if ('undefined' === typeof options.timeup) {
            options.timeup = 'DONE';
        }
        return options;
    }

})(node);
