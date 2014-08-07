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
         *  ### mainBox
         *  The TimerBox which displays the main timer.
         *
         * @see node.TimerBox
         */
        this.mainBox = null;   
        
        /**
         *  ### waitDiv
         *  The DIV in which to display the maximum waiting time left. 
         */
        this.waitBox = null;
        
        /**
         *  ### activeBox
         *  The DIV in which to display the time.
         *  
         *  This variable is always a reference to either 'waitDiv' or 
         *  'timerDiv'. 
         */
        this.activeBox = null;
        

        this.init(this.options);
    }

    VisualTimer.prototype.init = function(options) {
        var t, mainBoxOptions, waitBoxOptions;
        
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
        

        mainBoxOptions = {classNameBody: options.className, hideTitle: true};
        waitBoxOptions = {title: 'Max. wait timer', 
                classNameTitle: 'waitTimerTitle',
                classNameBody: 'waitTimerBody', hideBox: true};
                       
        if (!this.mainBox) {
            this.mainBox = new TimerBox(mainBoxOptions);
        }
        else {
            this.mainBox.init(mainBoxOptions);
        }
        if (!this.waitBox) {
            this.waitBox = new TimerBox(waitBoxOptions);
        } 
        else {
            this.waitBox.init(waitBoxOptions);
        }
        
        this.activeBox = this.mainBox;
    };

    VisualTimer.prototype.append = function() {
        this.bodyDiv.appendChild(this.mainBox.boxDiv);
        this.bodyDiv.appendChild(this.waitBox.boxDiv);
      
        this.activeBox = this.mainBox;
        this.updateDisplay();
    };
    /**
     *  ## VisualTimer.updateDisplay
     *  Changes 'activeBox' to display current time of 'gameTimer'
     */
    VisualTimer.prototype.updateDisplay = function() {
//        debugger
        var time, minutes, seconds;
        if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
            this.activeBox.bodyDiv.innerHTML = '00:00';
            return;
        }
        time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
        time = J.parseMilliseconds(time);
        minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
        seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
        this.activeBox.bodyDiv.innerHTML = minutes + ':' + seconds;
    };

    /**
     *  ## VisualTimer.start
     *  Starts the timer and changes the display accordingly.
     *
     *  Starts the 'gameTimer', hides 'waitDiv', unstrikes 'timerDiv' and
     *  sets 'activeBox' as a reference to 'timerDiv'.
     *
     *  @see VisualTimer.updateDisplay
     *  @see GameTimer.start
     */
    VisualTimer.prototype.start = function() {
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
        this.stop();
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
     *  'activeBox' is set such that 'VisualTimer.updateDisplay' updates 'waitDiv',
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
        if (!this.gameTimer.isStopped()) {
            this.activeBox.timeLeft = this.gameTimer.timeLeft;
            this.gameTimer.stop();
        }  
    };
    
    VisualTimer.prototype.switchActiveBoxTo = function(box,options) {
        var waitTime;
        this.activeBox = box;
        this.activeBox.timeLeft = this.gameTimer.timeLeft || 0;
        if (typeof options === 'undefined' ||
                typeof options.waitTime === 'undefined') {
            waitTime = this.activeBox.timeLeft;
        }
        else {
            waitTime = options.waitTime;
        }
        if (waitTime > 0) {
            if (!this.gameTimer.isStopped()){
            this.gameTimer.stop();}
            this.gameTimer.restart({milliseconds: waitTime});
        }
        this.updateDisplay();
    };

    /**
     *  ## VisualTimer.resume
     *  Resumes the 'gameTimer' and hides 'waitDiv'
     *
     *  @see GameTimer.resume
     */
    VisualTimer.prototype.resume = function() {
        this.gameTimer.resume();
    };

    VisualTimer.prototype.setToZero = function() {
        debugger
        this.stop();
        this.activeBox.bodyDiv.innerHTML = '00:00';
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
        debugger
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
                that.stop();
                that.init(options);
                that.mainBox.setClassNameBody('');
                that.switchActiveBoxTo(that.mainBox,-1);
                that.mainBox.unhideBox();
                that.waitBox.hideBox();
                that.start();
            }
        });

        node.on('REALLY_DONE', function() {
            that.mainBox.setClassNameBody('strike');
            that.switchActiveBoxTo(that.waitBox);
            that.waitBox.unhideBox();
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
    
    function TimerBox(options) {
        this.boxDiv = null;
        this.titleDiv = null;
        this.bodyDiv = null;
        
        this.timeLeft = null;
                
        this.boxDiv = node.window.getDiv();
        this.titleDiv = node.window.addDiv(this.boxDiv);
        this.bodyDiv = node.window.addDiv(this.boxDiv);
        
        this.init(options);
    
    }
    
    TimerBox.prototype.init = function(options) {        
        if (options) {
            if (options.hideTitle) {
                this.hideTitle();
            }
            else {
                this.unhideTitle();
            }
            if (options.hideBody) {
                this.hideBody();
            }
            else {
                this.unhideBody();
            }
            if (options.hideBox) {
                this.hideBox();
            }   
            else {
                this.unhideBox();
            }
        }

        this.setTitle(options.title || '');
        this.setClassNameTitle(options.classNameTitle || '');
        this.setClassNameBody(options.classNameBody || '');
        
        if(options.timeLeft) {
            this.timeLeft = options.timeLeft;
        }
    };
    
    TimerBox.prototype.hideBox = function() {
        this.boxDiv.style.display = 'none';
    };
    TimerBox.prototype.unhideBox = function() {
        this.boxDiv.style.display = '';
    };
    TimerBox.prototype.hideTitle = function() {
        this.titleDiv.style.display = 'none';
    };
    TimerBox.prototype.unhideTitle = function() {
        this.titleDiv.style.display = '';
    };
    TimerBox.prototype.hideBody = function() {
        this.bodyDiv.style.display = 'none';
    };
    TimerBox.prototype.unhideBody = function() {
        this.bodyDiv.style.display = '';
    };
    TimerBox.prototype.setTitle = function(title) {
        this.titleDiv.innerHTML = title;
    };
    TimerBox.prototype.setClassNameTitle = function(className) {
        this.titleDiv.className = className;
    };
    TimerBox.prototype.setClassNameBody = function(className) {
        this.bodyDiv.className = className;
    };

})(node);
