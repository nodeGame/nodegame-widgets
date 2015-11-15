/**
 * # WaitingRoom
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Display the number of connected / required players to start a game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitingRoom', WaitingRoom);

    // ## Meta-data

    WaitingRoom.version = '0.1.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'Waiting Room';
    WaitingRoom.className = 'waitingroom';

    // ## Dependencies

    WaitingRoom.dependencies = {
        JSUS: {},
        VisualTimer: {}
    };

    /**
     * ## WaitingRoom constructor
     *
     * Instantiates a new WaitingRoom object
     *
     * @param {object} options
     */
    function WaitingRoom(options) {

        /**
         * ### WaitingRoom.callbacks
         *
         * Array of all test callbacks
         */
        this.connected = 0;

        /**
         * ### WaitingRoom.stillChecking
         *
         * Number of tests still pending
         */
        this.poolSize = 0;

        /**
         * ### WaitingRoom.withTimeout
         *
         * The size of the group
         */
        this.groupSize = 0;

        /**
         * ### WaitingRoom.maxWaitTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.maxWaitTime = null;

        /**
         * ### WaitingRoom.timeoutId
         *
         * The id of the timeout, if created
         */
        this.timeoutId = null;

        /**
         * ### WaitingRoom.playerCountDiv
         *
         * Div containing the span for displaying the number of players
         *
         * @see WaitingRoom.playerCount
         */
        this.playerCountDiv = null;

        /**
         * ### WaitingRoom.playerCount
         *
         * Span displaying the number of connected players
         */
        this.playerCount = null;

        /**
         * ### WaitingRoom.timerDiv
         *
         * Div containing the timer
         *
         * @see WaitingRoom.timer
         */
        this.timerDiv = null;

        /**
         * ### WaitingRoom.timer
         *
         * VisualTimer instance for max wait time.
         *
         * @see VisualTimer
         */
        this.timer = null;

        /**
         * ### WaitingRoom.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### WaitingRoom.ontTimeout
         *
         * Callback to be executed if the timer expires
         */
        this.ontTimeout = null;

        /**
         * ### WaitingRoom.onTimeout
         *
         * TRUE if the timer expired
         */
        this.alreadyTimeUp = null;

    }

    // ## WaitingRoom methods

    /**
     * ### WaitingRoom.init
     *
     * Setups the requirements widget
     *
     * Available options:
     *
     *   - onComplete: function executed with either failure or success
     *   - onTimeout: function executed when at least one test fails
     *   - onSuccess: function executed when all tests succeed
     *   - maxWaitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object.');
        }
        if ('undefined' !== typeof conf.onTimeout) {
            if (null !== conf.onTimeout &&
                'function' !== typeof conf.onTimeout) {

                throw new TypeError('WaitingRoom.init: conf.onTimeout must ' +
                                    'be function, null or undefined.');
            }
            this.onTimeout = conf.onTimeout;
        }
        if (conf.maxWaitTime) {
            if (null !== conf.maxWaitTime &&
                'number' !== typeof conf.maxWaitTime) {

                throw new TypeError('WaitingRoom.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined.');
            }
            this.maxWaitTime = conf.maxWaitTime;
            this.startTimer();
        }

        if (conf.poolSize) {
            if (conf.poolSize && 'number' !== typeof conf.poolSize) {
                throw new TypeError('WaitingRoom.init: conf.poolSize ' +
                                    'must be number or undefined.');
            }
            this.poolSize = conf.poolSize;
        }

        if (conf.groupSize) {
            if (conf.groupSize && 'number' !== typeof conf.groupSize) {
                throw new TypeError('WaitingRoom.init: conf.groupSize ' +
                                    'must be number or undefined.');
            }
            this.groupSize = conf.groupSize;
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined.');
            }
            this.connected = conf.connected;
        }
    };

    /**
     * ### WaitingRoom.addTimeout
     *
     * Starts a timeout for the max waiting time
     *
     */
    WaitingRoom.prototype.startTimer = function() {
        if (this.timer) return;
        if (!this.maxWaitTime) return;
        if (!this.timerDiv) {
            this.timerDiv = document.createElement('div');
            this.timerDiv.id = 'timer-div';
        }
        this.timerDiv.appendChild(document.createTextNode(
            'Maximum Waiting Time: '
        ));
        this.timer = node.widgets.append('VisualTimer', this.timerDiv, {
            milliseconds: this.maxWaitTime,
            timeup: this.onTimeup,
            update: 1000
        });
        // Style up: delete title and border;
        this.timer.setTitle();
        this.timer.panelDiv.className = 'ng_widget visualtimer';
        // Append to bodyDiv.
        this.bodyDiv.appendChild(this.timerDiv);
        this.timer.start();
    };

    /**
     * ### WaitingRoom.clearTimeout
     *
     * Clears the timeout for the max execution time of the requirements
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ### WaitingRoom.updateDisplay
     *
     * Displays the state of the waiting room on screen
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateState = function(update) {
        if (!update) return;
        if ('number' === typeof update.connected) {
            this.connected = update.connected;
        }
        if ('number' === typeof update.poolSize) {
            this.poolSize = update.poolSize;
        }
        if ('number' === typeof update.groupSize) {
            this.groupSize = update.groupSize;
        }
    };

    /**
     * ### WaitingRoom.updateDisplay
     *
     * Displays the state of the waiting room on screen
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateDisplay = function() {
        this.playerCount.innerHTML = this.connected + ' / ' + this.poolSize;
    };

    WaitingRoom.prototype.append = function() {
        this.playerCountDiv = document.createElement('div');
        this.playerCountDiv.id = 'player-count-div';

        this.playerCountDiv.appendChild(
            document.createTextNode('Waiting for All Players to Connect: '));

        this.playerCount = document.createElement('p');
        this.playerCount.id = 'player-count';
        this.playerCountDiv.appendChild(this.playerCount);

        this.dots = W.getLoadingDots();
        this.playerCountDiv.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.playerCountDiv);

        if (this.maxWaitTime) {
            this.startTimer();
        }

    };

    WaitingRoom.prototype.listeners = function() {
        var that;
        that = this;

        node.registerSetup('waitroom', function(conf) {
            if (!conf) return;
            if ('object' !== typeof conf) {
                node.warn('waiting room widget: invalid setup object: ' + conf);
                return;
            }
            // Configure all requirements.
            that.init(conf);

            return conf;
        });

        // NodeGame Listeners.
        node.on.data('PLAYERSCONNECTED', function(msg) {
            if (!msg.data) return;
            that.connected = msg.data;
            that.updateDisplay();
        });

        node.on.data('TIME', function(msg) {
            timeIsUp.call(that, msg.data);
        });


        // Start waiting time timer.
        node.on.data('WAITTIME', function(msg) {

            // Avoid running multiple timers.
            // if (timeCheck) clearInterval(timeCheck);

            that.updateState(msg.data);
            that.updateDisplay();

        });

        node.on('SOCKET_DISCONNECT', function() {
            if (that.alreadyTimeUp) return;

            // Terminate countdown.
            if (that.timer) {
                that.timer.stop();
                that.timer.destroy();
            }

            // Write about disconnection in page.
            that.bodyDiv.innerHTML = '<span style="color: red">You have been ' +
                '<strong>disconnected</strong>. Please try again later.' +
                '</span><br><br>';

//             // Enough to not display it in case of page refresh.
//             setTimeout(function() {
//                 alert('Disconnection from server detected!');
//             }, 200);
        });
    };

    WaitingRoom.prototype.destroy = function() {
        node.deregisterSetup('waitroom');
    };

    // ## Helper methods

    function timeIsUp(data) {
        console.log('TIME IS UP!');

        if (this.alreadyTimeUp) return;
        this.alreadyTimeUp = true;
        if (this.timer) this.timer.stop();

        data = data || {};

        // All players have connected. Game starts.
        if (data.over === 'AllPlayersConnected') return;

        node.socket.disconnect();


        if (this.onTimeout) this.onTimeout(data);
    }

})(node);
