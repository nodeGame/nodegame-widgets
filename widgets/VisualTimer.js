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

        /**
         *  ### gameTimer
         *  
         *  The timer which counts down the game time.
         *
         *  @see node.timer.createTimer  
         */
        this.gameTimer = null;
        
        /**
         *  ### timerDiv
         *  The DIV in which to display the time left to make a move.
         */
        this.timerDiv = null;   
        
        /**
         *  ### waitDiv
         *  The DIV in which to display the maximum waiting time left. 
         */
        this.waitDiv = null;
        
        /**
         *  ### runDiv
         *  The DIV in which to display the time.
         *  
         *  This variable is always a reference to either 'waitDiv' or 
         *  'timerDiv'. 
         */
        this.runDiv = null;
        
        /**
         *  ### timeLeft
         *  Stores the time left when 'stop' is called.
         *  
         *  Not to be confused with gameTimer.timeLeft
         *
         *  @see VisualTimer.stop
         */
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
        this.waitDiv.style.display = 'none';
        
        titleWaitDiv = node.window.getDiv();
        titleWaitDiv.innerHTML = 'Max. Wait Time';
        titleWaitDiv.className = 'waitTimerTitle';
        this.waitDiv.appendChild(titleWaitDiv);
        
        timeWaitDiv = node.window.getDiv();
        timeWaitDiv.className = 'waitTimer';
        this.waitDiv.appendChild(timeWaitDiv);
        
        
        this.runDiv = this.timerDiv;
        this.updateDisplay();
    };
    /**
     *  ## VisualTimer.updateDisplay
     *  Changes 'runDiv' to display current time of 'gameTimer'
     */
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

    /**
     *  ## VisualTimer.start
     *  Starts the timer and changes the display accordingly.
     *
     *  Starts the 'gameTimer', hides 'waitDiv', unstrikes 'timerDiv' and
     *  sets 'runDiv' as a reference to 'timerDiv'.
     *
     *  @see VisualTimer.updateDisplay
     *  @see GameTimer.start
     */
    VisualTimer.prototype.start = function() {
        this.timerDiv.className = '';
        this.runDiv = this.timerDiv;
        this.waitDiv.style.display = 'none';
        this.updateDisplay();
        this.gameTimer.start();
    };

    /**
     *  ## VisualTimer.restart
     *  Restarts the timer with new options
     *
     *  @param {object} options Configuration object
     *
     *  @see VisualTimer.init
     *  @see VisualTimer.start
     */
    VisualTimer.prototype.restart = function(options) {
        this.init(options);
        this.start();
    };

    /**
     *  ## VisualTimer.stop
     *  Stops the timer display and start displaying max. wait time.
     *
     *  Does nothing if 'gameTimer' is stopped.
     *  Otherwise it updates 'timeLeft' with the current time in 'gameTimer',
     *  and changes the display according to the options object as follows.
     *
     *  If 'options.waitTime' is a _negative_ value, the 'gameTimer' is stopped,
     *  'VisualTimer.updateDisplay' is called and the function is returned
     *  If 'options' or 'options.waitTime' is _undefined_, the gameTimer is 
     *  restarted with the current time left on the clock. 
     *  Uf 'options.waitTime' is a _positive_ value, then the 'gameTimer' is 
     *  restarted with that value. 
     *  After the gameTimer has been restarted, 'waitDiv' is unhidden and 
     *  'runDiv' is set such that 'VisualTimer.updateDisplay' updates 'waitDiv',
     *  displaying the max. wait time.
     *
     *  @param {object} options Configuration object
     *
     *  @see VisualTimer.updateDisplay
     *  @see GameTimer.isStopped
     *  @see GameTimer.restart
     *  @see GameTimer.stop
     */
    VisualTimer.prototype.stop = function(options) {
        var waitTime;
        if (!this.gameTimer.isStopped()) {
            this.timeLeft = this.gameTimer.milliseconds -
                    this.gameTimer.timePassed;
            
            if (typeof options === 'undefined' ||
                    typeof options.waitTime === 'undefined') {
                waitTime = this.timeLeft;
            }
            else {
                waitTime = options.waitTime;
            }
            if (waitTime >= 0) {
                this.gameTimer.restart({milliseconds : waitTime});
                this.runDiv = this.waitDiv.children[1]; // timeWaitDiv
                this.waitDiv.style.display = '';
            }
            else {
                this.gameTimer.stop();
            }
            this.updateDisplay();
        }  
    };

    /**
     *  ## VisualTimer.resume
     *  Resumes the 'gameTimer' and hides 'waitDiv'
     *
     *  @see GameTimer.resume
     */
    VisualTimer.prototype.resume = function() {
        this.gameTimer.resume();
        this.waitDiv.style.display = 'none';
    };

    /**
     *  ## VisualTimer.resume
     *  Stops 'VisualTimer', hides 'waitDiv' and sets 'timerDiv' to zero.
     *
     *  @see VisualTimer.stop
     */
    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.waitDiv.style.display = 'none';
        this.timerDiv.innerHTML = '00:00';
    };
    
    /**
     *  ## VisualTimer.emptyTimer
     *  Changes 'timerDiv' to have an empty body.
     */
    VisualTimer.prototype.clearTimer = function() {
        this.timerDiv.innerHTML = '';
    };
    
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
