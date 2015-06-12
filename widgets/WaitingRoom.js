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

    var J = node.JSUS;

    node.widgets.register('WaitingRoom', WaitingRoom);

    // ## Meta-data

    WaitingRoom.version = '0.1.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'WaitingRoom';
    WaitingRoom.className = 'waitingRoom';

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
         * ### WaitingRoom.summary
         *
         * Span summarizing the status of the wait room
         */
        this.summary = null;

        /**
         * ### WaitingRoom.summaryUpdate
         *
         * Span displaying the number of connected players
         */
        this.summaryUpdate = null;

        /**
         * ### WaitingRoom.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### WaitingRoom.onComplete
         *
         * Callback to be executed at the end of all tests
         */
        this.onComplete = null;

        /**
         * ### WaitingRoom.onSuccess
         *
         * Callback to be executed at the end of all tests
         */
        this.onSuccess = null;

        /**
         * ### WaitingRoom.onTimeout
         *
         * Callback to be executed at the end of all tests
         */
        this.onTimeout = null;


        /**
         * ### WaitingRoom.timer
         *
         * VisualTimer instance for max wait time.
         *
         * @see VisualTimer
         */
        this.timer = null;

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
        if ('undefined' !== typeof conf.onComplete) {
            if (null !== conf.onComplete &&
                'function' !== typeof conf.onComplete) {

                throw new TypeError('WaitingRoom.init: conf.onComplete must ' +
                                    'be function, null or undefined.');
            }
            this.onComplete = conf.onComplete;
        }
        if ('undefined' !== typeof conf.onSuccess) {
            if (null !== conf.onSuccess &&
                'function' !== typeof conf.onSuccess) {

                throw new TypeError('WaitingRoom.init: conf.onSuccess must ' +
                                    'be function, null or undefined.');
            }
            this.onSuccess = conf.onSuccess;
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
            this.groupSize = conf.groupSize
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined.');
            }
            this.connected = conf.connected
        }
    };

    /**
     * ### WaitingRoom.addTimeout
     *
     * Starts a timeout for the max waiting time
     *
     */
    WaitingRoom.prototype.startTimer = function() {
        var that = this;
        if (this.timer) return;
        if (!this.maxWaitTime) return;
        this.timer = node.widgets.append('VisualTimer', this.summary, {
            milliseconds: this.maxWaitTime,
            timeup: this.onTimeup,
            update: 1000
        });
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
        this.summaryUpdate.innerHTML = this.connected + ' / ' + this.poolSize;
    };

    WaitingRoom.prototype.append = function() {

        this.summary = document.createElement('span');
        this.summary.appendChild(
            document.createTextNode('Waiting for all players to connect: '));

        this.summaryUpdate = document.createElement('span');
        this.summary.appendChild(this.summaryUpdate);

        this.dots = W.getLoadingDots();

        this.summary.appendChild(this.dots.span);

        if (this.maxWaitTime) {
            this.startTimer();
        }

        this.bodyDiv.appendChild(this.summary);


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
            timeIsUp(msg.data);
        });


        // Start waiting time timer.
        node.on.data('WAITTIME', function(msg) {

            // Avoid running multiple timers.
            // if (timeCheck) clearInterval(timeCheck);

            that.updateState(msg.data);
            that.updateDisplay();

        });

        node.on('SOCKET_DISCONNECT', function() {
            var connStatus;
            // Terminate countdown.
            // clearInterval(timeCheck);
            // Write about disconnection in page.
            connStatus = document.getElementById('connectionStatus');
            if (connStatus) {
                connStatus. innerHTML =
                    '<span style="color: red">You have been ' +
                    '<strong>disconnected</strong>. Please try again later.' +
                    '</span><br><br>';
            }
            // Enough to not display it in case of page refresh.
            setTimeout(function() {
                alert('Disconnection from server detected!');
            }, 200);
        });
    };

    WaitingRoom.prototype.destroy = function() {
        node.deregisterSetup('waitroom');
    };

    // ## Helper methods

    function Countdown() {
        var PrevMin = (minutes < 10) ? "0" : ":";
        var PrevSec = (seconds < 10) ? ":0" : ":";
        var TimeNow = PrevMin + minutes + PrevSec + seconds;

        if (DHTML) {
            if (NS4) {
                setContent("id", "Uhr", null,
                           '<span class="Uhr">' + TimeNow + "<\/span>");
            }
            else {
                setContent("id", "Uhr", null, TimeNow);
            }
            if (minutes > 0 && seconds == 0) {
                minutes--;
                seconds = 59;
            }
            else seconds--;
        }
    }

    function timeIsUp(data) {
        var timeOut;

        console.log('TIME IS UP!');
        return;

        // if (alreadyTimeUp) return;
        // alreadyTimeUp = true;

        // clearInterval(timeCheck);

        // All players have connected. Game starts.
        if (data && data.over === 'AllPlayersConnected') return;

        node.socket.disconnect();

        // Enough Time passed, not enough players connected.
        if (data && data.over === 'Time elapsed!!!') {

            timeOut = "<h3 align='center'>Thank you for your patience.<br>";
            timeOut += "Unfortunately, there are not enough participants in ";
            timeOut += "your group to start the experiment.<br>";

            timeOut += "You will be payed out a fix amount for your ";
            timeOut += "participation up to this point.<br><br>";

            timeOut += "Please go back to Amazon Mechanical Turk ";
            timeOut += "web site and submit the hit.<br>";

            timeOut += "We usually pay within 24 hours. <br>For any ";
            timeOut += "problems, please look for a HIT called ";
            timeOut += "<strong>ETH Descil Trouble Ticket</strong> and file ";
            timtOut += "a new trouble ticket reporting the exit code ";
            timeOut += "as written below.<br><br>";

            timeOut += "Exit Code: " + data.exit + "<br> </h3>";
        }

        // Too much time passed, but no message from server received.
        else {
            timeOut = "An error has occurred. You seem to be ";
            timeOut += "waiting for too long. Please look for a HIT called ";
            timeOut += "<strong>ETH Descil Trouble Ticket</strong> and file ";
            timeOut += "a new trouble ticket reporting your experience."
        }

        document.getElementById("startPage").innerHTML = timeOut;
    }

})(node);
