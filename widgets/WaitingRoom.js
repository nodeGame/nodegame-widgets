/**
 * # WaitingRoom
 * Copyright(c) 2016 Stefano Balietti
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

    WaitingRoom.version = '1.1.0';
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
         * ### WaitingRoom.connected
         *
         * Number of players connected
         */
        this.connected = 0;

        /**
         * ### WaitingRoom.poolSize
         *
         * Number of players connected before groups are made
         */
        this.poolSize = 0;

        /**
         * ### WaitingRoom.nGames
         *
         * Total number of games to be dispatched
         */
        this.nGames = 0;

        /**
         * ### WaitingRoom.groupSize
         *
         * The size of the group
         */
        this.groupSize = 0;

        /**
         * ### WaitingRoom.waitTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.waitTime = null;

        /**
         * ### WaitingRoom.startDate
         *
         * The exact date and time when the game starts
         */
        this.startDate = null;

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
         * ### WaitingRoom.startDateDiv
         *
         * Div containing the start date
         */
        this.startDateDiv = null;

        /**
         * ### WaitingRoom.msgDiv
         *
         * Div containing optional messages to display
         */
        this.msgDiv = null;

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
         * ### WaitingRoom.onTimeout
         *
         * Callback to be executed if the timer expires
         */
        this.onTimeout = null;


        /**
         * ### WaitingRoom.disconnectMessage
         *
         * String to be put into `this.bodyDiv.innerHTML` when player
         * is disconnected.
         */
        this.disconnectMessage = null;

        /**
         * ### WaitingRoom.disconnectIfNotSelected
         *
         * Flag that indicates whether to disconnect an not selected player
         */
        this.disconnectIfNotSelected = null;
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
     *   - onTimeout: function executed when timer runs out
     *   - onSuccess: function executed when all tests succeed
     *   - waitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object.');
        }
        if (conf.onTimeout) {
            if ('function' !== typeof conf.onTimeout) {
                throw new TypeError('WaitingRoom.init: conf.onTimeout must ' +
                                    'be function, null or undefined.');
            }
            this.onTimeout = conf.onTimeout;
        }
        if (conf.waitTime) {
            if (null !== conf.waitTime &&
                'number' !== typeof conf.waitTime) {

                throw new TypeError('WaitingRoom.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined.');
            }
            this.waitTime = conf.waitTime;
            this.startTimer();
        }
        // TODO: check conditions?
        if (conf.startDate) {
            this.setStartDate(conf.startDate);
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
        if (conf.nGames) {
            if (conf.nGames && 'number' !== typeof conf.nGames) {
                throw new TypeError('WaitingRoom.init: conf.nGames ' +
                                    'must be number or undefined.');
            }
            this.nGames = conf.nGames;
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined.');
            }
            this.connected = conf.connected;
        }

        if (conf.disconnectMessage) {
            if ('string' !== typeof conf.disconnectMessage) {
                throw new TypeError('WaitingRoom.init: ' +
                        'conf.disconnectMessage must be string or undefined.');
            }
            this.disconnectMessage = conf.disconnectMessage;
        }
        else {
            this.disconnectMessage = '<span style="color: red">You have been ' +
                '<strong>disconnected</strong>. Please try again later.' +
                '</span><br><br>';
        }

        if (conf.disconnectIfNotSelected) {
            if ('boolean' !== typeof conf.disconnectIfNotSelected) {
                throw new TypeError('WaitingRoom.init: ' +
                    'conf.disconnectIfNotSelected must be boolean or ' +
                    'undefined.');
            }
            this.disconnectIfNotSelected = conf.disconnectIfNotSelected;
        }
        else {
            this.disconnectIfNotSelected = false;
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
        if (!this.waitTime) return;
        if (!this.timerDiv) {
            this.timerDiv = document.createElement('div');
            this.timerDiv.id = 'timer-div';
        }
        this.timerDiv.appendChild(document.createTextNode(
            'Maximum Waiting Time: '
        ));
        this.timer = node.widgets.append('VisualTimer', this.timerDiv, {
            milliseconds: this.waitTime,
            timeup: function() {
                that.bodyDiv.innerHTML =
                    'Waiting for too long. Please look for a HIT called ' +
                    '<strong>ETH Descil Trouble Ticket</strong> and file' +
                    ' a new trouble ticket reporting your experience.';
            },
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
     * ### WaitingRoom.updateState
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
        var numberOfGameSlots, numberOfGames;
        if (this.connected > this.poolSize) {
            numberOfGames = Math.floor(this.connected / this.groupSize);
            numberOfGames = numberOfGames > this.nGames ?
                this.nGames : numberOfGames;
            numberOfGameSlots = numberOfGames * this.groupSize;

            this.playerCount.innerHTML = '<span style="color:red">' +
                this.connected + '</span>' + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = '';
            this.playerCountTooHigh.innerHTML = 'There are more players in ' +
                'this waiting room than there are playslots in the game. ' +
                'Only ' + numberOfGameSlots + ' players will be selected to ' +
                'play the game.';
        }
        else {
            this.playerCount.innerHTML = this.connected + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = 'none';
        }
    };

    WaitingRoom.prototype.append = function() {
        this.playerCountDiv = document.createElement('div');
        this.playerCountDiv.id = 'player-count-div';

        this.playerCountDiv.appendChild(
            document.createTextNode('Waiting for All Players to Connect: '));

        this.playerCount = document.createElement('p');
        this.playerCount.id = 'player-count';
        this.playerCountDiv.appendChild(this.playerCount);

        this.playerCountTooHigh = document.createElement('div');
        this.playerCountTooHigh.style.display = 'none';
        this.playerCountDiv.appendChild(this.playerCountTooHigh);

        this.dots = W.getLoadingDots();
        this.playerCountDiv.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.playerCountDiv);

        this.startDateDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.startDateDiv);
        this.startDateDiv.style.display= 'none';

        this.msgDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.msgDiv);

        if (this.startDate) {
            this.setStartDate(this.startDate);
        }
        if (this.waitTime) {
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

        node.on.data('DISPATCH', function(msg) {
            var data, notSelected, reportExitCode;
            msg = msg || {};
            data = msg.data || {};

            reportExitCode = '<br>You have been disconnected. ' +
                ('undefined' !== typeof data.exit ?
                 ('Please report this exit code: ' + data.exit) : '') +
                '<br></h3>';

            if (data.action === 'AllPlayersConnected') {
                that.alertPlayer();
            }

            else if (data.action === 'NotEnoughPlayers') {

                that.bodyDiv.innerHTML =
                    '<h3 align="center" style="color: red">' +
                    'Thank you for your patience.<br>' +
                    'Unfortunately, there are not enough participants in ' +
                    'your group to start the experiment.<br>';

                if (that.onTimeout) that.onTimeout(msg.data);

                that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
            }

            else if (data.action === 'NotSelected') {

                notSelected = '<h3 align="center">' +
                    '<span style="color: red">Unfortunately, you were ' +
                    '<strong>not selected</strong> to join the game this time';

                if (false === data.shouldDispatchMoreGames ||
                    that.disconnectIfNotSelected) {

                    that.bodyDiv.innerHTML = notSelected + '. Thank you ' +
                        'for your participation.</span></h3><br><br>';

                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
                else {
                    that.msgDiv.innerHTML = notSelected + ', but you ' +
                        'may join the next one.</span> ' +
                        '<a class="hand" onclick=' +
                        'javascript:this.parentElement.innerHTML="">' +
                        'Ok, I got it.</a></h3><br><br>';
                }
            }

            else if (data.action === 'Disconnect') {
                that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
            }
        });

        node.on.data('TIME', function(msg) {
            msg = msg || {};
            console.log('TIME IS UP!');
            that.stopTimer();
        });

        // Start waiting time timer.
        node.on.data('WAITTIME', function(msg) {

            // Avoid running multiple timers.
            // if (timeCheck) clearInterval(timeCheck);

            that.updateState(msg.data);
            that.updateDisplay();

        });

        node.on('SOCKET_DISCONNECT', function() {

            // Terminate countdown.
            that.stopTimer();

            // Write about disconnection in page.
            that.bodyDiv.innerHTML = that.disconnectMessage;

//             // Enough to not display it in case of page refresh.
//             setTimeout(function() {
//                 alert('Disconnection from server detected!');
//             }, 200);
        });

        node.on.data('ROOM_CLOSED', function() {
            that.disconnect('<span style="color: red"> The waiting ' +
                'room is <strong>CLOSED</strong>. You have been disconnected.' +
                ' Please try again later.' +
                '</span><br><br>');
        });
    };

    WaitingRoom.prototype.setStartDate = function(startDate) {
        this.startDate = new Date(startDate).toString();
        this.startDateDiv.innerHTML = 'Game starts at: <br>' + this.startDate;
        this.startDateDiv.style.display = '';
    };

    WaitingRoom.prototype.stopTimer = function() {
        if (this.timer) {
            console.log('STOPPING TIMER');
            this.timer.destroy();
        }
    };

    WaitingRoom.prototype.disconnect = function(msg) {
        if (msg) this.disconnectMessage = msg;
        node.socket.disconnect();
        this.stopTimer();
    };

    WaitingRoom.prototype.alertPlayer = function() {
        var clearBlink, onFrame;

        JSUS.playSound('/sounds/doorbell.ogg');
        // If document.hasFocus() returns TRUE, then just one repeat is enough.
        if (document.hasFocus && document.hasFocus()) {
            JSUS.blinkTitle('GAME STARTS!', { repeatFor: 1 });
        }
        // Otherwise we repeat blinking until an event that shows that the
        // user is active on the page happens, e.g. focus and click. However,
        // the iframe is not created yet, and even later. if the user clicks it
        // it won't be detected in the main window, so we need to handle it.
        else {
            clearBlink = JSUS.blinkTitle('GAME STARTS!', {
                stopOnFocus: true,
                stopOnClick: window
            });
            onFrame = function() {
                var frame;
                clearBlink();
                frame = W.getFrame();
                if (frame) {
                    frame.removeEventListener('mouseover', onFrame, false);
                }
            };
            node.events.ng.once('FRAME_GENERATED', function(frame) {
                frame.addEventListener('mouseover', onFrame, false);
            });
        }
    };

    WaitingRoom.prototype.destroy = function() {
        if (this.dots) this.dots.stop();
        node.deregisterSetup('waitroom');
    };

})(node);
