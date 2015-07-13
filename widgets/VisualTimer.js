/**
 * # VisualTimer
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display a timer for the game. Timer can trigger events.
 * Only for countdown smaller than 1h.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('VisualTimer', VisualTimer);


    // ## Meta-data

    VisualTimer.version = '0.5.0';
    VisualTimer.description = 'Display a timer for the game. Timer can ' +
        'trigger events. Only for countdown smaller than 1h.';

    VisualTimer.title = 'Time left';
    VisualTimer.className = 'visualtimer';

    // ## Dependencies

    VisualTimer.dependencies = {
        GameTimer: {},
        JSUS: {}
    };

    /**
     * ## VisualTimer constructor
     *
     * `VisualTimer` displays and manages a `GameTimer`
     *
     * @param {object} options Optional. Configuration options
     * The options it can take are:
     *
     *   - any options that can be passed to a `GameTimer`
     *   - `waitBoxOptions`: an option object to be passed to `TimerBox`
     *   - `mainBoxOptions`: an option object to be passed to `TimerBox`
     *
     * @see TimerBox
     * @see GameTimer
     */
    function VisualTimer(options) {
        this.options = options || {};

        /**
         * ### VisualTimer.gameTimer
         *
         * The timer which counts down the game time
         *
         * @see node.timer.createTimer
         */
        this.gameTimer = null;

        /**
         * ### VisualTimer.mainBox
         *
         * The `TimerBox` which displays the main timer
         *
         * @see TimerBox
         */
        this.mainBox = null;

        /**
         * ### VisualTimer.waitBox
         *
         * The `TimerBox` which displays the wait timer
         *
         * @see TimerBox
         */
        this.waitBox = null;

        /**
         * ### VisualTimer.activeBox
         *
         * The `TimerBox` in which to display the time
         *
         * This variable is always a reference to either `waitBox` or
         * `mainBox`.
         *
         * @see TimerBox
         */
        this.activeBox = null;

        /**
         * ### VisualTimer.isInitialized
         *
         * Indicates whether the instance has been initializded already
         */
        this.isInitialized = false;

        this.init(this.options);
    }

    // ## VisualTimer methods

    /**
     * ### VisualTimer.init
     *
     * Initializes the instance. When called again, adds options to current ones
     *
     * The options it can take are:
     *
     * - any options that can be passed to a `GameTimer`
     * - waitBoxOptions: an option object to be passed to `TimerBox`
     * - mainBoxOptions: an option object to be passed to `TimerBox`
     *
     * @param {object} options Optional. Configuration options
     *
     * @see TimerBox
     * @see GameTimer
     */
    VisualTimer.prototype.init = function(options) {
        var t;
        options = options || {};
        if ('object' !== typeof options) {
            throw new TypeError('VisualTimer.init: options must be ' +
                                'object or undefined');
        }
        J.mixout(options, this.options);

        if (options.hooks) {
            if (!options.hooks instanceof Array) {
                options.hooks = [options.hooks];
            }
        }
        else {
            options.hooks = [];
        }

        // Only push this hook once.
        if (!this.isInitialized) {
            options.hooks.push({
                hook: this.updateDisplay,
                ctx: this,
                name: 'VisualTimer.updateDisplay'
            });
        }

        if (!this.gameTimer) {
            this.gameTimer = node.timer.createTimer();
        }

        // TODO: make it consistent with processOptions.
        if ('function' === typeof options.milliseconds) {
            options.milliseconds = options.milliseconds.call(node.game);
        }

        this.gameTimer.init(options);

        t = this.gameTimer;
        node.session.register('visualtimer', {
            set: function(p) {
                // TODO
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

        if ('undefined' === typeof this.options.update) {
            this.options.update = 1000;
        }
        if ('undefined' === typeof this.options.stopOnDone) {
            this.options.stopOnDone = true;
        }
        if ('undefined' === typeof this.options.startOnPlaying) {
            this.options.startOnPlaying = true;
        }

        if (!this.options.mainBoxOptions) {
            this.options.mainBoxOptions = {};
        }
        if (!this.options.waitBoxOptions) {
            this.options.waitBoxOptions = {};
        }

        J.mixout(this.options.mainBoxOptions,
                {classNameBody: options.className, hideTitle: true});
        J.mixout(this.options.waitBoxOptions,
                {title: 'Max. wait timer',
                classNameTitle: 'waitTimerTitle',
                classNameBody: 'waitTimerBody', hideBox: true});

        if (!this.mainBox) {
            this.mainBox = new TimerBox(this.options.mainBoxOptions);
        }
        else {
            this.mainBox.init(this.options.mainBoxOptions);
        }
        if (!this.waitBox) {
            this.waitBox = new TimerBox(this.options.waitBoxOptions);
        }
        else {
            this.waitBox.init(this.options.waitBoxOptions);
        }

        this.activeBox = this.options.activeBox || this.mainBox;

        this.isInitialized = true;
    };

    VisualTimer.prototype.append = function() {
        this.bodyDiv.appendChild(this.mainBox.boxDiv);
        this.bodyDiv.appendChild(this.waitBox.boxDiv);

        this.activeBox = this.mainBox;
        this.updateDisplay();
    };

    /**
     * ### VisualTimer.clear
     *
     * Reverts state of `VisualTimer` to right after a constructor call
     *
     * @param {object} options Configuration object
     *
     * @return {object} oldOptions The Old options
     *
     * @see node.timer.destroyTimer
     * @see VisualTimer.init
     */
    VisualTimer.prototype.clear = function(options) {
        var oldOptions;
        options = options || {};
        oldOptions = this.options;

        node.timer.destroyTimer(this.gameTimer);

        this.gameTimer = null;
        this.activeBox = null;
        this.isInitialized = false;
        this.init(options);

        return oldOptions;
    };

    /**
     * ### VisualTimer.updateDisplay
     *
     * Changes `activeBox` to display current time of `gameTimer`
     *
     * @see TimerBox.bodyDiv
     */
    VisualTimer.prototype.updateDisplay = function() {
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
     * ### VisualTimer.start
     *
     * Starts the timer
     *
     * @see VisualTimer.updateDisplay
     * @see GameTimer.start
     */
    VisualTimer.prototype.start = function() {
        this.updateDisplay();
        this.gameTimer.start();
    };

    /**
     * ### VisualTimer.restart
     *
     * Restarts the timer with new options
     *
     * @param {object} options Configuration object
     *
     * @see VisualTimer.init
     * @see VisualTimer.start
     * @see VisualTimer.stop
     */
    VisualTimer.prototype.restart = function(options) {
        this.stop();
        this.init(options);
        this.start();
    };

    /**
     * ### VisualTimer.stop
     *
     * Stops the timer display and stores the time left in `activeBox.timeLeft`
     *
     * @param {object} options Configuration object
     *
     * @see GameTimer.isStopped
     * @see GameTimer.stop
     */
    VisualTimer.prototype.stop = function(options) {
        if (!this.gameTimer.isStopped()) {
            this.activeBox.timeLeft = this.gameTimer.timeLeft;
            this.gameTimer.stop();
        }
    };
    /**
     * ### VisualTimer.switchActiveBoxTo
     *
     * Switches the display of the `gameTimer` into the `TimerBox` `box`
     *
     * Stores `gameTimer.timeLeft` into `activeBox` and then switches
     * `activeBox` to reference `box`.
     *
     * @param {TimerBox} box TimerBox in which to display `gameTimer` time
     */
    VisualTimer.prototype.switchActiveBoxTo = function(box) {
        this.activeBox.timeLeft = this.gameTimer.timeLeft || 0;
        this.activeBox = box;
        this.updateDisplay();
    };

    /**
      * ### VisualTimer.startWaiting
      *
      * Stops the timer and changes the appearance to a max. wait timer
      *
      * If options and/or options.milliseconds are undefined, the wait timer
      * will start with the current time left on the `gameTimer`. The mainBox
      * will be striked out, the waitBox set active and unhidden. All other
      * options are forwarded directly to `VisualTimer.restart`.
      *
      * @param {object} options Configuration object
      *
      * @see VisualTimer.restart
      */
    VisualTimer.prototype.startWaiting = function(options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        options = J.clone(options);
        if (typeof options.milliseconds === 'undefined') {
            options.milliseconds = this.gameTimer.timeLeft;
        }
        if (typeof options.mainBoxOptions === 'undefined') {
            options.mainBoxOptions = {};
        }
        if (typeof options.waitBoxOptions === 'undefined') {
            options.waitBoxOptions = {};
        }
        options.mainBoxOptions.classNameBody = 'strike';
        options.mainBoxOptions.timeLeft = this.gameTimer.timeLeft || 0;
        options.activeBox = this.waitBox;
        options.waitBoxOptions.hideBox = false;
        this.restart(options);
    };

    /**
      * ### VisualTimer.startTiming
      *
      * Starts the timer and changes appearance to a regular countdown
      *
      * The mainBox will be unstriked and set active, the waitBox will be
      * hidden. All other options are forwarded directly to
      * `VisualTimer.restart`.
      *
      * @param {object} options Configuration object
      *
      * @see VisualTimer.restart
      */
    VisualTimer.prototype.startTiming = function(options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        options = J.clone(options);
        if (typeof options.mainBoxOptions === 'undefined') {
            options.mainBoxOptions = {};
        }
        if (typeof options.waitBoxOptions === 'undefined') {
            options.waitBoxOptions = {};
        }
        options.activeBox = this.mainBox;
        options.waitBoxOptions.timeLeft = this.gameTimer.timeLeft || 0;
        options.waitBoxOptions.hideBox = true;
        options.mainBoxOptions.classNameBody = '';
        this.restart(options);
    };

    /**
     * ### VisualTimer.resume
     *
     * Resumes the `gameTimer`
     *
     * @see GameTimer.resume
     */
    VisualTimer.prototype.resume = function() {
        this.gameTimer.resume();
    };

    /**
     * ### VisualTimer.setToZero
     *
     * Stops `gameTimer` and sets `activeBox` to display `00:00`
     *
     * @see GameTimer.resume
     */
    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.activeBox.bodyDiv.innerHTML = '00:00';
        this.activeBox.setClassNameBody('strike');
    };

    /**
     * ### VisualTimer.isTimeup
     *
     * Returns TRUE if the timer expired
     *
     * This method is added for backward compatibility.
     *
     * @see GameTimer.isTimeup
     */
    VisualTimer.prototype.setToZero = function() {
        return this.gameTimer.isTimeup();
    };

    /**
     * ### VisualTimer.doTimeUp
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
            if (that.options.startOnPlaying) {
                stepObj = node.game.getCurrentStep();
                if (!stepObj) return;
                timer = stepObj.timer;
                if (timer) {
                    // TODO: should be that.options.
                    options = processOptions(timer, this.options);
                    that.startTiming(options);
                }
            }
        });

        node.on('REALLY_DONE', function() {
            if (that.options.stopOnDone) {
                if (!that.gameTimer.isStopped()) {
                    that.startWaiting();
                }
            }
       });
    };

    VisualTimer.prototype.destroy = function() {
        node.timer.destroyTimer(this.gameTimer);
        this.bodyDiv.removeChild(this.mainBox.boxDiv);
        this.bodyDiv.removeChild(this.waitBox.boxDiv);
    };

    // ## Helper functions

    /**
     * ### processOptions
     *
     * Clones and mixes in user options with current options
     *
     * Return object is transformed accordingly.
     *
     * @param {object} options Configuration options
     * @param {object} curOptions Current configuration of VisualTimer
     *
     * @return {object} Clean, valid configuration object
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

   /**
     * # TimerBox
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Represents a box wherin to display a `VisualTimer`
     */

    /**
     * ## TimerBox constructor
     *
     * `TimerBox` represents a box wherein to display the timer
     *
     * @param {object} options Optional. Configuration options
     *   The options it can take are:
     *
     *   - `hideTitle`
     *   - `hideBody`
     *   - `hideBox`
     *   - `title`
     *   - `classNameTitle`
     *   - `classNameBody`
     *   - `timeLeft`
     */
    function TimerBox(options) {
        /**
         * ### TimerBox.boxDiv
         *
         * The Div which will contain the title and body Divs
         */
        this.boxDiv = null;

        /**
         * ### TimerBox.titleDiv
         *
         * The Div which will contain the title
         */
        this.titleDiv = null;
        /**
         * ### TimerBox.bodyDiv
         *
         * The Div which will contain the numbers
         */
        this.bodyDiv = null;

        /**
         * ### TimerBox.timeLeft
         *
         * Used to store the last value before focus is taken away
         */
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

        if (options.timeLeft) {
            this.timeLeft = options.timeLeft;
        }
    };

    // ## TimerBox methods

    /**
     * ### TimerBox.hideBox
     *
     * Hides entire `TimerBox`
     */
    TimerBox.prototype.hideBox = function() {
        this.boxDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideBox
     *
     * Hides entire `TimerBox`
     */
    TimerBox.prototype.unhideBox = function() {
        this.boxDiv.style.display = '';
    };

    /**
     * ### TimerBox.hideTitle
     *
     * Hides title of `TimerBox`
     */
    TimerBox.prototype.hideTitle = function() {
        this.titleDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideTitle
     *
     * Unhides title of `TimerBox`
     */
    TimerBox.prototype.unhideTitle = function() {
        this.titleDiv.style.display = '';
    };

    /**
     * ### TimerBox.hideBody
     *
     * Hides body of `TimerBox`
     */
    TimerBox.prototype.hideBody = function() {
        this.bodyDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideBody
     *
     * Unhides Body of `TimerBox`
     */
    TimerBox.prototype.unhideBody = function() {
        this.bodyDiv.style.display = '';
    };

    /**
     * ### TimerBox.setTitle
     *
     * Sets title of `TimerBox`
     */
    TimerBox.prototype.setTitle = function(title) {
        this.titleDiv.innerHTML = title;
    };

    /**
     * ### TimerBox.setClassNameTitle
     *
     * Sets class name of title of `TimerBox`
     */
    TimerBox.prototype.setClassNameTitle = function(className) {
        this.titleDiv.className = className;
    };

    /**
     * ### TimerBox.setClassNameBody
     *
     * Sets class name of body of `TimerBox`
     */
    TimerBox.prototype.setClassNameBody = function(className) {
        this.bodyDiv.className = className;
    };

})(node);
