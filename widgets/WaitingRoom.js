/**
 * # WaitingRoom
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Displays the number of connected/required players to start a game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitingRoom', WaitingRoom);
    // ## Meta-data

    WaitingRoom.version = '1.3.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'Waiting Room';
    WaitingRoom.className = 'waitingroom';

    // ## Dependencies

    WaitingRoom.dependencies = {
        JSUS: {},
        VisualTimer: {}
    };

    // ## Prototype Properties.

    /** ### WaitingRoom.sounds
     *
     * Default sounds to play on particular events
     */
    WaitingRoom.sounds = {

        // #### dispatch
        dispatch: '/sounds/doorbell.ogg'
    };

    /** ### WaitingRoom.texts
     *
     * Default texts to display
     */
    WaitingRoom.texts = {

        // #### blinkTitle
        blinkTitle: 'GAME STARTS!',

        // #### waitingForConf
        waitingForConf: 'Waiting to receive data',

        // #### executionMode
        executionMode: function(w) {
            if (w.executionMode === 'WAIT_FOR_N_PLAYERS') {
                return 'Waiting for All Players to Connect: ';
            }
            if (w.executionMode === 'WAIT_FOR_DISPATCH') {
                return 'Task will start soon. Please be patient.';
            }
            // TIMEOUT.
            return 'Task will start at: <br>' + w.startDate;
        },

        // #### disconnect
        disconnect: '<span style="color: red">You have been ' +
            '<strong>disconnected</strong>. Please try again later.' +
            '</span><br><br>',

        // #### waitedTooLong
        waitedTooLong: 'Waiting for too long. Please look ' +
            'for a HIT called <strong>Trouble Ticket</strong> and file' +
            ' a new trouble ticket reporting your experience.',

        // #### notEnoughPlayers
        notEnoughPlayers: '<h3 align="center" style="color: red">' +
            'Thank you for your patience.<br>' +
            'Unfortunately, there are not enough participants in ' +
            'your group to start the experiment.<br>',

        // #### roomClosed
        roomClosed: '<span style="color: red"> The ' +
            'waiting room is <strong>CLOSED</strong>. You have been ' +
            'disconnected. Please try again later.</span><br><br>',

        // #### tooManyPlayers
        tooManyPlayers: function(widget, data) {
            var str;
            str = 'There are more players in this waiting room ' +
                'than playslots in the game. ';
            if (widget.poolSize === 1) {
                str += 'Each player will play individually.';
            }
            else {
                str += 'Only ' + data.nGames + ' players will be selected ' +
                    'to play the game.';
            }
            return str;
        },

        // #### notSelectedClosed
        notSelectedClosed: '<h3 align="center">' +
            '<span style="color: red">Unfortunately, you were ' +
            '<strong>not selected</strong> to join the game this time. ' +
            'Thank you for your participation.</span></h3><br><br>',

        // #### notSelectedOpen
        notSelectedOpen: '<h3 align="center">' +
            '<span style="color: red">Unfortunately, you were ' +
            '<strong>not selected</strong> to join the game this time, ' +
            'but you may join the next one.</span><a class="hand" ' +
            'onclick=javascript:this.parentElement.innerHTML="">' +
            'Ok, I got it.</a></h3><br><br>' +
            'Thank you for your participation.</span></h3><br><br>',

        // #### exitCode
        exitCode: function(widget, data) {
            return '<br>You have been disconnected. ' +
                ('undefined' !== typeof data.exit ?
                 ('Please report this exit code: ' + data.exit) : '') +
                '<br></h3>';
        },

        // #### playBot
        playBot: function(widget) {
            if (widget.poolSize === widget.groupSize &&
                widget.groupSize === 1) {

                return 'Play';
            }
            if (widget.groupSize === 2) return 'Play With Bot';
            return 'Play With Bots';
        },

        // #### connectingBots
        connectingBots:  function(widget) {
            console.log(widget.poolSize, widget.groupSize);
            if (widget.poolSize === widget.groupSize &&
                widget.groupSize === 1) {

                return 'Starting, Please Wait...';
            }
            if (widget.groupSize === 2) return 'Connecting Bot, Please Wait...';
            return 'Connecting Bot/s, Please Wait...';
        },

        // #### selectTreatment
        // Trailing space makes it nicer.
        selectTreatment: 'Select Treatment ',

        // #### gameTreatments
        gameTreatments: 'Game:',

        // #### defaultTreatments
        defaultTreatments: 'Defaults:'


    };

    /**
     * ## WaitingRoom constructor
     *
     * Instantiates a new WaitingRoom object
     *
     * @param {object} options
     */
    function WaitingRoom() {

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
         *
         * Server will close the waiting room afterwards.
         *
         * Undefined means no limit.
         */
        this.nGames = undefined;

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
         * ### WaitingRoom.executionMode
         *
         * The execution mode.
         */
        this.executionMode = null;

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
         * ### WaitingRoom.execModeDiv
         *
         * Div containing the span for displaying the number of players
         *
         * @see WaitingRoom.playerCount
         */
        this.execModeDiv = null;

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
         * ### WaitingRoom.disconnectIfNotSelected
         *
         * Flag that indicates whether to disconnect an not selected player
         */
        this.disconnectIfNotSelected = null;

        /**
         * ### WaitingRoom.playWithBotOption
         *
         * If TRUE, it displays a button to begin the game with bots
         *
         * This option is set by the server, local modifications will
         * not have an effect if server does not allow it
         *
         * @see WaitingRoom.playBotBtn
         */
        this.playWithBotOption = null;

        /**
         * ### WaitingRoom.playBotBtn
         *
         * Reference to the button to play with bots
         *
         * Will be created if requested by options.
         *
         * @see WaitingRoom.playWithBotOption
         */
        this.playBotBtn = null;

        /**
         * ### WaitingRoom.selectTreatmentOption
         *
         * If TRUE, it displays a selector to choose the treatment of the game
         *
         * This option is set by the server, local modifications will
         * not have an effect if server does not allow it
         */
        this.selectTreatmentOption = null;

        /**
         * ### WaitingRoom.treatmentBtn
         *
         * Holds the name of selected treatment
         *
         * Only used if `selectTreatmentOption` is enabled
         *
         * @see WaitingRoom.selectTreatmentOption
         */
        this.selectedTreatment = null;

    }

    // ## WaitingRoom methods

    /**
     * ### WaitingRoom.init
     *
     * Setups the requirements widget
     *
     * TODO: Update this doc (list of options).
     *
     * Available options:
     *
     *   - onComplete: function executed with either failure or success
     *   - onTimeout: function executed when timer runs out
     *   - onSuccess: function executed when all tests succeed
     *   - waitTime: max waiting time to execute all tests (in milliseconds)
     *   - startDate: max waiting time to execute all tests (in milliseconds)
     *   - playWithBotOption: displays button to dispatch players with bots
     *   - selectTreatmentOption: displays treatment selector
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        var that = this;

        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object. ' +
                                'Found: ' + conf);
        }

        // It receives the TEXTS AND SOUNDS only first.
        if (!conf.executionMode) return;

        // TODO: check types and conditions?
        this.executionMode = conf.executionMode;

        if (conf.onTimeout) {
            if ('function' !== typeof conf.onTimeout) {
                throw new TypeError('WaitingRoom.init: conf.onTimeout must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onTimeout);
            }
            this.onTimeout = conf.onTimeout;
        }

        if (conf.waitTime) {
            if (null !== conf.waitTime &&
                'number' !== typeof conf.waitTime) {

                throw new TypeError('WaitingRoom.init: conf.waitTime ' +
                                    'must be number, null or undefined. ' +
                                    'Found: ' + conf.waitTime);
            }
            this.waitTime = conf.waitTime;
        }

        if (conf.startDate) {
            this.startDate = new Date(conf.startDate).toString();
        }

        if (conf.poolSize) {
            if (conf.poolSize && 'number' !== typeof conf.poolSize) {
                throw new TypeError('WaitingRoom.init: conf.poolSize ' +
                                    'must be number or undefined. Found: ' +
                                    conf.poolSize);
            }
            this.poolSize = conf.poolSize;
        }

        if (conf.groupSize) {
            if (conf.groupSize && 'number' !== typeof conf.groupSize) {
                throw new TypeError('WaitingRoom.init: conf.groupSize ' +
                                    'must be number or undefined. Found: ' +
                                    conf.groupSize);
            }
            this.groupSize = conf.groupSize;
        }
        if (conf.nGames) {
            if (conf.nGames && 'number' !== typeof conf.nGames) {
                throw new TypeError('WaitingRoom.init: conf.nGames ' +
                                    'must be number or undefined. Found: ' +
                                    conf.nGames);
            }
            this.nGames = conf.nGames;
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined. Found: ' +
                                    conf.connected);
            }
            this.connected = conf.connected;
        }

        if (conf.disconnectIfNotSelected) {
            if ('boolean' !== typeof conf.disconnectIfNotSelected) {
                throw new TypeError('WaitingRoom.init: ' +
                    'conf.disconnectIfNotSelected must be boolean or ' +
                    'undefined. Found: ' + conf.disconnectIfNotSelected);
            }
            this.disconnectIfNotSelected = conf.disconnectIfNotSelected;
        }
        else {
            this.disconnectIfNotSelected = false;
        }


        if (conf.playWithBotOption) this.playWithBotOption = true;
        else this.playWithBotOption = false;
        if (conf.selectTreatmentOption) this.selectTreatmentOption = true;
        else this.selectTreatmentOption = false;


        // Display Exec Mode.
        this.displayExecMode();

        // Button for bots and treatments.

        if (this.playWithBotOption && !document.getElementById('bot_btn')) {
            // Closure to create button group.
            (function(w) {
                var btnGroup = document.createElement('div');
                btnGroup.role = 'group';
                btnGroup['aria-label'] = 'Play Buttons';
                btnGroup.className = 'btn-group';

                var playBotBtn = document.createElement('input');
                playBotBtn.className = 'btn btn-primary btn-lg';
                playBotBtn.value = w.getText('playBot');
                playBotBtn.id = 'bot_btn';
                playBotBtn.type = 'button';
                playBotBtn.onclick = function() {
                    w.playBotBtn.value = w.getText('connectingBots');
                    w.playBotBtn.disabled = true;
                    node.say('PLAYWITHBOT', 'SERVER', w.selectedTreatment);
                    setTimeout(function() {
                        w.playBotBtn.value = w.getText('playBot');
                        w.playBotBtn.disabled = false;
                    }, 5000);
                };

                btnGroup.appendChild(playBotBtn);

                // Store reference in widget.
                w.playBotBtn = playBotBtn;

                if (w.selectTreatmentOption) {

                    var btnGroupTreatments = document.createElement('div');
                    btnGroupTreatments.role = 'group';
                    btnGroupTreatments['aria-label'] = 'Select Treatment';
                    btnGroupTreatments.className = 'btn-group';

                    var btnTreatment = document.createElement('button');
                    btnTreatment.className = 'btn btn-default btn-lg ' +
                        'dropdown-toggle';
                    btnTreatment['data-toggle'] = 'dropdown';
                    btnTreatment['aria-haspopup'] = 'true';
                    btnTreatment['aria-expanded'] = 'false';
                    btnTreatment.innerHTML = w.getText('selectTreatment');

                    var span = document.createElement('span');
                    span.className = 'caret';

                    btnTreatment.appendChild(span);

                    var ul = document.createElement('ul');
                    ul.className = 'dropdown-menu';
                    ul.style['text-align'] = 'left';

                    var li, a, t, liT1, liT2, liT3;
                    if (conf.availableTreatments) {
                        li = document.createElement('li');
                        li.innerHTML = w.getText('gameTreatments');
                        li.className = 'dropdown-header';
                        ul.appendChild(li);
                        for (t in conf.availableTreatments) {
                            if (conf.availableTreatments.hasOwnProperty(t)) {
                                li = document.createElement('li');
                                li.id = t;
                                a = document.createElement('a');
                                a.href = '#';
                                a.innerHTML = '<strong>' + t + '</strong>: ' +
                                    conf.availableTreatments[t];
                                li.appendChild(a);
                                if (t === 'treatment_latin_square') liT3 = li;
                                else if (t === 'treatment_rotate') liT1 = li;
                                else if (t === 'treatment_random') liT2 = li;
                                else ul.appendChild(li);
                            }
                        }
                        li = document.createElement('li');
                        li.role = 'separator';
                        li.className = 'divider';
                        ul.appendChild(li);
                        li = document.createElement('li');
                        li.innerHTML = w.getText('defaultTreatments');
                        li.className = 'dropdown-header';
                        ul.appendChild(li);
                        ul.appendChild(liT1);
                        ul.appendChild(liT2);
                        ul.appendChild(liT3);
                    }

                    btnGroupTreatments.appendChild(btnTreatment);
                    btnGroupTreatments.appendChild(ul);

                    btnGroup.appendChild(btnGroupTreatments);

                    // We are not using bootstrap js files
                    // and we redo the job manually here.
                    btnTreatment.onclick = function() {
                        // When '' is hidden by bootstrap class.
                        if (ul.style.display === '') {
                            ul.style.display = 'block';
                        }
                        else {
                            ul.style.display = '';
                        }
                    };

                    ul.onclick = function(eventData) {
                        var t;
                        t = eventData.target;
                        // When '' is hidden by bootstrap class.
                        ul.style.display = '';
                        t = t.parentNode.id;
                        // Clicked on description?
                        if (!t) t = eventData.target.parentNode.parentNode.id;
                        // Nothing relevant clicked (e.g., header).
                        if (!t) return;
                        btnTreatment.innerHTML = t + ' ';
                        btnTreatment.appendChild(span);
                        w.selectedTreatment = t;
                    };

                    // Store Reference in widget.
                    w.treatmentBtn = btnTreatment;
                }
                // Append button group.
                w.bodyDiv.appendChild(document.createElement('br'));
                w.bodyDiv.appendChild(btnGroup);

            })(this);
        }

        // Handle destroy.
        this.on('destroyed', function() {
            if (that.dots) that.dots.stop();
            node.deregisterSetup('waitroom');
        });
    };

    /**
     * ### WaitingRoom.startTimer
     *
     * Starts a timeout for the max waiting time
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
                that.bodyDiv.innerHTML = that.getText('waitedTooLong');
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
     * Displays the state of the waiting room on screen (player count)
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateDisplay = function() {
        var numberOfGameSlots, numberOfGames;
        if (this.connected > this.poolSize) {
            numberOfGames = Math.floor(this.connected / this.groupSize);
            if ('undefined' !== typeof this.nGames) {
                numberOfGames = numberOfGames > this.nGames ?
                    this.nGames : numberOfGames;
            }
            numberOfGameSlots = numberOfGames * this.groupSize;

            this.playerCount.innerHTML = '<span style="color:red">' +
                this.connected + '</span>' + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = '';

            // Update text.
            this.playerCountTooHigh.innerHTML =
                this.getText('tooManyPlayers', { nGames: numberOfGameSlots });
        }
        else {
            this.playerCount.innerHTML = this.connected + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = 'none';
        }
    };

    /**
     * ### WaitingRoom.displayExecMode
     *
     * Builds the basic layout of the execution mode
     *
     * @see WaitingRoom.executionMode
     */
    WaitingRoom.prototype.displayExecMode = function() {
        this.bodyDiv.innerHTML = '';

        this.execModeDiv = document.createElement('div');
        this.execModeDiv.id = 'exec-mode-div';

        this.execModeDiv.innerHTML = this.getText('executionMode');

        // TODO: add only on some modes? Depending on settings?
        this.playerCount = document.createElement('p');
        this.playerCount.id = 'player-count';
        this.execModeDiv.appendChild(this.playerCount);

        this.playerCountTooHigh = document.createElement('div');
        this.playerCountTooHigh.style.display = 'none';
        this.execModeDiv.appendChild(this.playerCountTooHigh);

        this.startDateDiv = document.createElement('div');
        this.startDateDiv.style.display= 'none';
        this.execModeDiv.appendChild(this.startDateDiv);

        this.dots = W.getLoadingDots();
        this.execModeDiv.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.execModeDiv);

        this.msgDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.msgDiv);


        // if (this.startDate) this.setStartDate(this.startDate);
        if (this.waitTime) this.startTimer();

    };

    WaitingRoom.prototype.append = function() {
        // Configuration will arrive soon.
        this.bodyDiv.innerHTML = this.getText('waitingForConf');
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

            // It receives 2 conf messages.
            if (!conf.executionMode) {
                // Sounds.
                that.setSounds(conf.sounds);
                // Texts.
                that.setTexts(conf.texts);
            }
            else {
                // Configure all requirements.
                that.init(conf);
            }

            return conf;
        });

        // NodeGame Listeners.
        node.on.data('PLAYERSCONNECTED', function(msg) {
            if (!msg.data) return;
            that.connected = msg.data;
            that.updateDisplay();
        });

        node.on.data('DISPATCH', function(msg) {
            var data, reportExitCode;
            msg = msg || {};
            data = msg.data || {};

            if (that.dots) that.dots.stop();

            // Alert player he/she is about to play.
            if (data.action === 'allPlayersConnected') {
                that.alertPlayer();
            }
            // Not selected/no game/etc.
            else {
                reportExitCode = that.getText('exitCode', data);

                if (data.action === 'notEnoughPlayers') {
                    that.bodyDiv.innerHTML = that.getText(data.action);
                    if (that.onTimeout) that.onTimeout(msg.data);
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
                else if (data.action === 'notSelected') {

                    if (false === data.shouldDispatchMoreGames ||
                        that.disconnectIfNotSelected) {

                        that.bodyDiv.innerHTML =
                            that.getText('notSelectedClosed');

                        that.disconnect(that.bodyDiv.innerHTML +
                                        reportExitCode);
                    }
                    else {
                        that.msgDiv.innerHTML = that.getText('notSelectedOpen');
                    }
                }
                else if (data.action === 'disconnect') {
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
            }
        });

        node.on.data('TIME', function() {
            node.info('waiting room: TIME IS UP!');
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
            that.bodyDiv.innerHTML = that.getText('disconnect');

            // Enough to not display it in case of page refresh.
            // setTimeout(function() {
            //              alert('Disconnection from server detected!');
            //             }, 200);
        });

        node.on.data('ROOM_CLOSED', function() {
            that.disconnect(that.getText('roomClosed'));
        });
    };

    WaitingRoom.prototype.stopTimer = function() {
        if (this.timer) {
            node.info('waiting room: STOPPING TIMER');
            this.timer.destroy();
        }
    };

    /**
     * ### WaitingRoom.disconnect
     *
     * Disconnects the playr, stops the timer, and displays a msg
     *
     * @param {string|function} msg. Optional. A disconnect message. If set,
     *    replaces the current value for future calls.
     *
     * @see WaitingRoom.setText
     */
    WaitingRoom.prototype.disconnect = function(msg) {
        if (msg) this.setText('disconnect', msg);
        node.socket.disconnect();
        this.stopTimer();
    };

    WaitingRoom.prototype.alertPlayer = function() {
        var clearBlink, onFrame;
        var blink, sound;

        blink = this.getText('blinkTitle');

        sound = this.getSound('dispatch');

        // Play sound, if requested.
        if (sound) J.playSound(sound);

        // If blinkTitle is falsy, don't blink the title.
        if (!blink) return;

        // If document.hasFocus() returns TRUE, then just one repeat is enough.
        if (document.hasFocus && document.hasFocus()) {
            J.blinkTitle(blink, { repeatFor: 1 });
        }
        // Otherwise we repeat blinking until an event that shows that the
        // user is active on the page happens, e.g. focus and click. However,
        // the iframe is not created yet, and even later. if the user clicks it
        // it won't be detected in the main window, so we need to handle it.
        else {
            clearBlink = J.blinkTitle(blink, {
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

})(node);
