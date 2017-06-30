/**
 * # WaitingRoom
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Display the number of connected / required players to start a game
 *
 * TODO: accepts functions for `texts` variables, so that they can
 * integrate current values
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitingRoom', WaitingRoom);
    // ## Meta-data

    WaitingRoom.version = '1.2.0';
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
        tooManyPlayers: function(widget, numberOfGameSlots) {
            return 'There are more players in this waiting room ' +
                'than there are playslots in the game. Only ' +
                 numberOfGameSlots + ' players will be selected ' +
                'to play the game.';
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

        exitCode: function(widget, data) {
            return '<br>You have been disconnected. ' +
                ('undefined' !== typeof data.exit ?
                 ('Please report this exit code: ' + data.exit) : '') +
                '<br></h3>';
        }
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
         * ### WaitingRoom.disconnectIfNotSelected
         *
         * Flag that indicates whether to disconnect an not selected player
         */
        this.disconnectIfNotSelected = null;

        /**
         * ### WaitingRoom.texts
         *
         * Contains all the texts displayed to the players
         *
         * @see WaitingRoom.setText
         * @see WaitingRoom.getText
         * @see WaitingRoom.setTexts
         * @see WaitingRoom.getTexts
         */
        this.texts = {};

        /**
         * ### WaitingRoom.sounds
         *
         * List of custom sounds to play to the players
         *
         * @see WaitingRoom.setSound
         * @see WaitingRoom.getSound
         * @see WaitingRoom.setSounds
         * @see WaitingRoom.getSounds
         */
        this.sounds = {};
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
     *   - startDate: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object. ' +
                                'Found: ' + conf);
        }
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
            this.startTimer();
        }
        // TODO: check conditions?
        if (conf.startDate) {
            this.setStartDate(conf.startDate);
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

        // Sounds.

        this.setSounds(conf.texts);
        
        // Texts.
        this.setTexts(conf.texts);
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

            // TODO: check here (was a debugger).
            
            // Update text.
            this.playerCountTooHigh.innerHTML =
                this.getText('tooManyPlayers', numberOfGameSlots);
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
            var data, reportExitCode;
            msg = msg || {};
            data = msg.data || {};

            // Alert player he/she is about to play.
            if (data.action === 'AllPlayersConnected') {
                that.alertPlayer();
            }
            // Not selected/no game/etc.
            else {
                reportExitCode = that.getText('exitCode', msg.data);

                if (data.action === 'NotEnoughPlayers') {                    
                    that.bodyDiv.innerHTML = that.getText('notEnoughPlayers');
                    if (that.onTimeout) that.onTimeout(msg.data);
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
                else if (data.action === 'NotSelected') {

                    if (false === data.shouldDispatchMoreGames ||
                        that.disconnectIfNotSelected) {
                        
                        that.bodyDiv.innerHTML =
                            that.getText('notSelectedClosed');

                        that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                    }
                    else {
                        that.msgDiv.innerHTML = that.getText('notSelectedOpen');
                    }
                }
                else if (data.action === 'Disconnect') {
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
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
            that.bodyDiv.innerHTML = that.getText('disconnect');

//             // Enough to not display it in case of page refresh.
//             setTimeout(function() {
//                 alert('Disconnection from server detected!');
//             }, 200);
        });

        node.on.data('ROOM_CLOSED', function() {
            that.disconnect(that.getText('roomClosed'));
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

        // Play sound, if requested.
        if (this.dispatchSound) JSUS.playSound(this.dispatchSound);

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

    /**
     * ### WaitingRoom.setSound
     *
     * Checks and assigns the value of a sound to play to user
     *
     * Throws an error if value is invalid
     *
     * @param {string} name The name of the sound to check
     * @param {mixed} path Optional. The path to the audio file. If undefined
     *    the default value from WaitingRoom.sounds is used
     * @param {boolean} noDefault Optional. If true, no default value is
     *    assigned in case value is undefined. Default: false
     *
     * @see WaitingRoom.sounds
     * @see WaitingRoom.getSound
     * @see WaitingRoom.setSounds
     * @see WaitingRoom.getSounds
     */
    WaitingRoom.prototype.setSound = function(name, value, noDefault) {
        strSetter(this, name, value, noDefault, 'texts', 'setSound');
    };

    /**
     * ### WaitingRoom.setSounds
     *
     * Assigns multiple sounds at the same time
     *
     * @param {object} sounds Optional. Object containing sound paths
     *
     * @see WaitingRoom.sounds
     * @see WaitingRoom.setSound
     * @see WaitingRoom.getSound
     * @see WaitingRoom.getSounds
     */
    WaitingRoom.prototype.setSounds = function(sounds, noDefault) {
        strSetterMulti(this, sounds, noDefault, 'sounds', 'setSound',
                       'setSounds');
    };
    
    /**
     * ### WaitingRoom.getSound
     *
     * Returns the requested sound path
     *
     * @param {string} name The name of the sound variable.
     * @param {mixed} param Optional. Additional info to pass to the
     *   callback, if any
     *
     * @return {string} The requested sound
     *
     * @see WaitingRoom.sounds
     * @see WaitingRoom.setSound
     * @see WaitingRoom.getSound
     * @see WaitingRoom.getSounds
     */
    WaitingRoom.prototype.getSound = function(name, param) {
        return strGetter(this, name, param, 'sounds', 'getSounds');       
    };
    
    /**
     * ### WaitingRoom.getSounds
     *
     * Returns an object with all current sounds
     *
     * @param {object} param Optional. Object containing parameters to pass
     *   to the sounds functions (if any)
     *
     * @return {object} out All current sounds
     *
     * @see WaitingRoom.sounds
     * @see WaitingRoom.setSound
     * @see WaitingRoom.getSound
     * @see WaitingRoom.setSounds
     */
    WaitingRoom.prototype.getSounds = function(param) {       
        return strGetterMulti(this, param, 'sounds', 'getSound', 'getSounds');
    };
    
    /**
     * ### WaitingRoom.setText
     *
     * Checks and assigns the value of a text to display to user
     *
     * Throws an error if value is invalid
     *
     * @param {string} name The name of the property to check
     * @param {mixed} value Optional. The value for the text. If undefined
     *    the default value from WaitingRoom.texts is used
     * @param {boolean} noDefault Optional. If true, no default value is
     *    assigned in case value is undefined. Default: false
     *
     * @see WaitingRoom.texts
     * @see WaitingRoom.getText
     * @see WaitingRoom.setTexts
     * @see WaitingRoom.getTexts
     */
    WaitingRoom.prototype.setText = function(name, value, noDefault) {
        strSetter(this, name, value, noDefault, 'texts', 'setText');
    };

    /**
     * ### WaitingRoom.setTexts
     *
     * Assigns all texts
     *
     * @param {object} texts Optional. Object containing texts
     *
     * @see WaitingRoom.texts
     * @see WaitingRoom.setText
     * @see WaitingRoom.getText
     * @see WaitingRoom.getTexts
     */
    WaitingRoom.prototype.setTexts = function(texts, noDefault) {
        strSetterMulti(this, texts, noDefault, 'texts', 'setText', 'setTexts');
    };
    
    /**
     * ### WaitingRoom.getText
     *
     * Returns the requested text
     *
     * @param {string} name The name of the text variable.
     * @param {mixed} param Optional. Additional to pass to the callback, if any
     *
     * @return {string} The requested text
     *
     * @see WaitingRoom.texts
     * @see WaitingRoom.setText
     * @see WaitingRoom.setTexts
     * @see WaitingRoom.getTexts
     */
    WaitingRoom.prototype.getText = function(name, param) {
        return strGetter(this, name, param, 'texts', 'getTexts');       
    };
    
    /**
     * ### WaitingRoom.getAllTexts
     *
     * Returns an object with all current texts
     *
     * @param {object|array} param Optional. Object containing parameters to pass
     *   to the texts functions (if any)
     *
     * @return {object} out All current texts
     *
     * @see WaitingRoom.texts
     * @see WaitingRoom.setText
     * @see WaitingRoom.setTexts
     * @see WaitingRoom.getText
     */   
    WaitingRoom.prototype.getTexts = function(paramOrKeys, param) {
        if (J.isArray(paramOrKeys)) {
            // TODO: continue here.
        }
        return strGetterMulti(this, 'texts', 'getText',
                              'getTexts', undefined, param);
    };

    // ## Helper functions.

    /**
     * ### strGetter
     *
     * Returns the value a property from a collection in instance/constructor
     *
     * If the string is not found in the live instance, the default value
     * from the same collection inside the contructor is returned instead.
     *
     * If the property is not found in the corresponding static
     * collection in the constructor of the instance, an error is thrown.
     *
     * @param {object} that The main instance
     * @param {string} name The name of the property inside the collection
     * @param {string} collection The name of the collection inside the instance
     * @param {string} method The name of the invoking method (for error string)
     * @param {mixed} param Optional. If the value of the requested property
     *   is a function, this parameter is passed to it to get a return value.
     *
     * @return {string} res The value of requested property as found
     *   in the instance, or its default value as found in the constructor
     */
    function strGetter(that, name, collection, method, param) {
        var res;
        if (!that.constructor[collection].hasOwnProperty(name)) {
            throw new Error('WaitingRoom.' + method +
                            ': unknown item: ' + name);
        }
        res = that[collection][name];
        if ('function' === typeof res) {
            res = res(that, param);
            if ('string' !== typeof res) {
                throw new TypeError('WaitingRoom.' + method + ': cb "' + name +
                                    'did not return a string. Found: ' + res);
            }
        }
        else if ('undefined' === typeof res) {
            res = that.constructor[collection][name];
        }
        return res;
    }
    
    /**
     * ### strGetterMulti
     *
     * Same as strGetter, but returns multiple values at once
     *
     * @param {object} that The main instance
     * @param {string} collection The name of the collection inside the instance
     * @param {string} collection The name of the invoking method (to
     *   create the error string)
     * @param {mixed} param Optional. If the value of the requested property
     *    is a function, this parameter is passed to it to get a return value.
     * @param {mixed} param Optional. If the value of the requested property
     *    is a function, this parameter is passed to it to get a return value.
     *
     * @return {string} res The requested value.
     *
     * @see strGetter
     */
    function strGetterMulti(that, collection, getMethod, method, obj, param) {
        var t, out;
        out = {};
        for (t in that[collection]) {
            if (that[collection].hasOwnProperty(t)) {
                out[t] = that[getMethod](t, param);
            }
        }
        return out;
    }

    function strSetterMulti(that, obj, noDefault,
                            collection, setMethod, method) {

        var i, out;
        out = out || {};
        if ('object' !== typeof obj && 'undefined' !== typeof obj) {
            throw new TypeError('WaitingRoom.' + method + ': ' +  collection +
                                ' must be object or undefined. Found: ' + obj);
        }
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                that[setMethod](i, obj[i], noDefault);
            }
        }
    }
    
    
    function strSetter(that, name, value, noDefault, collection, method) {
        if ('undefined' === typeof that[collection][name]) {
            throw new TypeError('WaitingRoom.' + method + ': unrecognized ' +
                                'name: ' + name);
        }
        if ('undefined' === typeof value) {
            if (!noDefault) {
                that[collection][name] = WaitingRoom[collection][name];
            }
        }
        else if ('string' === typeof value || 'function' === typeof value) {
            that[collection][name] = value;
        }
        else {
            throw new TypeError('WaitingRoom.' + method + ': value for item "' +
                                name + '" must be string, function or ' +
                                'undefined. Found: ' + value);
        }
    }
    
})(node);
