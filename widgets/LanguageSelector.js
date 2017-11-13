/**
 * # LanguageSelector
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Manages and displays information about languages available and selected
 *
 * @TODO: bubble event in case of buttons (now there are many listeners).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('LanguageSelector', LanguageSelector);

    // ## Meta-data

    LanguageSelector.version = '0.6.1';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allows to change language.';
    LanguageSelector.title = 'Language';
    LanguageSelector.className = 'languageselector';

    LanguageSelector.texts.loading = 'Loading language information...';

    // ## Dependencies

    LanguageSelector.dependencies = {
        JSUS: {}
    };

    /**
     * ## LanguageSelector constructor
     *
     * Manages the setting and display of the language used
     *
     * @param {object} options Optional. Configuration options
     *
     * @see Player.lang
     */
    function LanguageSelector(options) {
        var that = this;

        this.options = options;

        /**
         * ### LanguageSelector.availableLanguages
         *
         * Object containing an object per availble language.
         *
         * The language object contains at least the following properties:
         *
         * - `name`: Name of the language in English.
         * - `nativeName`: Native name of the language
         * - `shortName`: An abbreviation for the language, also determines the
         *    path to the context files for this language.
         *
         * The key for each language object is its `shortName`.
         *
         * @see Player.lang
         */
        this.availableLanguages = {
            en: {
                name: 'English',
                nativeName: 'English',
                shortName: 'en'
            }
        };

        /**
         * ### LanguageSelector.currentLanguageIndex
         *
         * A reference to the currently used language
         *
         * @see LanguageSelector.availableLanguages
         */
        this.currentLanguage = null;

        /**
         * ### LanguageSelector.buttonListLength
         *
         * Specifies maximum number of radio buttons used in selection tool
         */
        this.buttonListLength = null;

        /**
         * ### LanguageSelector.displayForm
         *
         * The form in which the widget displays the language information
         */
        this.displayForm = null;

        /**
         * ### LanguageSelector.optionsLabel
         *
         * Array containing the labels for the language selection optionsDisplay
         */
        this.optionsLabel = {};

        /**
         * ### LanguageSelector.optionsDisplay
         *
         * Array containing the optionsDisplay for the language selection
         */
        this.optionsDisplay = {};

        /**
         * ### LanguageSelector.loadingDiv
         *
         * Div displaying information on whether the languages have been loaded
         */
        this.loadingDiv = null;

        /**
         * ### LanguageSelector.languagesLoaded
         *
         * Flag indicating whether languages have been loaded from server
         */
        this.languagesLoaded = false;

        /**
         * ## LanguageSelector.usingButtons
         *
         * Flag indicating if the interface should have buttons
         *
         * Default: TRUE.
         */
        this.usingButtons = true;

        /**
         * ## LanguageSelector.updatePlayer
         *
         * Specifies when updating the player
         *
         * Available options:
         *
         *   - false: alias for 'never',
         *   - 'never': never notifies,
         *   - 'onselect': each time a selection is made,
         *   - 'ondone': when current step is done.
         *
         * Default: 'ondone'
         */
        this.updatePlayer = 'ondone';

        /**
         * ## LanguageSelector.setUriPrefix
         *
         * If TRUE, the Window URI prefix is updated when the player is updated
         *
         * Default: TRUE.
         *
         * @see GameWindow.setUriPrefix
         */
        this.setUriPrefix = true;

        /**
         * ## LanguageSelector.notifyServer
         *
         * If TRUE, a message is sent to the server when the player is updated
         *
         * Default: TRUE.
         */
        this.notifyServer = true;

        /**
         * ### LanguageSelector.onLangCallback
         *
         * Function to be called when languages have been loaded
         *
         * Initializes form displaying the information as well
         * as the optionsDisplay and their labels.
         * Initializes language to English.
         * Forwards to `LanguageSelector.onLangCallbackExtension` at the very
         * end.
         *
         * @param {object} msg GameMsg
         *
         * @see LanguageSelector.setLanguage
         */
        this.onLangCallback = function(msg) {
            var language;

            // Clear display.
            while (that.displayForm.firstChild) {
                that.displayForm.removeChild(that.displayForm.firstChild);
            }

            // Initialize widget.
            that.availableLanguages = msg.data;
            if (that.usingButtons) {

                // Creates labeled buttons.
                for (language in msg.data) {
                    if (msg.data.hasOwnProperty(language)) {
                        that.optionsLabel[language] = W.get('label', {
                            id: language + 'Label',
                            'for': language + 'RadioButton'
                        });

                        that.optionsDisplay[language] = W.get('input', {
                            id: language + 'RadioButton',
                            type: 'radio',
                            name: 'languageButton',
                            value: msg.data[language].name
                        });

                        that.optionsDisplay[language].onclick =
                            makeSetLanguageOnClick(language);

                        that.optionsLabel[language].appendChild(
                            that.optionsDisplay[language]);
                        that.optionsLabel[language].appendChild(
                            document.createTextNode(
                                msg.data[language].nativeName));
                        W.add('br', that.displayForm);
                        that.optionsLabel[language].className =
                            'unselectedButtonLabel';
                        that.displayForm.appendChild(
                            that.optionsLabel[language]);
                    }
                }
            }
            else {

                that.displaySelection = W.get('select', 'selectLanguage');
                for (language in msg.data) {
                    that.optionsLabel[language] =
                        document.createTextNode(msg.data[language].nativeName);
                    that.optionsDisplay[language] = W.get('option', {
                        id: language + 'Option',
                        value: language
                    });
                    that.optionsDisplay[language].appendChild(
                        that.optionsLabel[language]);
                    that.displaySelection.appendChild(
                        that.optionsDisplay[language]);

                }
                that.displayForm.appendChild(that.displaySelection);
                that.displayForm.onchange = function() {
                    that.setLanguage(that.displaySelection.value,
                                     that.updatePlayer === 'onselect');
                };
            }

            that.loadingDiv.style.display = 'none';
            that.languagesLoaded = true;

            // Initialize with current value inside player object,
            // or default to English. Does not update the player object yet.
            that.setLanguage(node.player.lang.shortName || 'en', false);

            // Extension point.
            if (that.onLangCallbackExtension) {
                that.onLangCallbackExtension(msg);
                that.onLangCallbackExtension = null;
            }

            function makeSetLanguageOnClick(langStr) {
                return function() {
                    that.setLanguage(langStr, that.updatePlayer === 'onselect');
                };
            }
        };

        /**
         * ### LanguageSelector.onLangCallbackExtension
         *
         * Extension point to `LanguageSelector.onLangCallback`
         *
         * @see LanguageSelector.onLangCallback
         */
        this.onLangCallbackExtension = null;
    }

    // ## LanguageSelector methods

    /**
     * ### LanguageSelector.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options
     *
     * @see LanguageSelector.onLangCallback
     */
    LanguageSelector.prototype.init = function(options) {
        J.mixout(options, this.options);
        this.options = options;

        if ('undefined' !== typeof this.options.usingButtons) {
            this.usingButtons = !!this.options.usingButtons;
        }

        if ('undefined' !== typeof this.options.notifyServer) {
            if (false === this.options.notifyServer) {
                this.options.notifyServer = 'never';
            }
            else if ('string' === typeof this.options.notifyServer) {
                if ('never' === this.options.notifyServer ||
                    'onselect' === this.options.notifyServer ||
                    'ondone' === this.options.notifyServer) {

                    this.notifyServer = this.options.notifyServer;
                }
                else {
                    throw new Error('LanguageSelector.init: invalid value ' +
                                    'for notifyServer: "' +
                                    this.options.notifyServer + '". Valid ' +
                                    'values: "never","onselect", "ondone".');
                }
            }
            else {
                throw new Error('LanguageSelector.init: options.notifyServer ' +
                                'must be ' +
                                this.options.notifyServer);
            }
        }

        if ('undefined' !== typeof this.options.setUriPrefix) {
            this.setUriPrefix = !!this.options.setUriPrefix;
        }

        // Register listener.
        // TODO: should it be moved into the listeners method?
        // TODO: calling init twice will add it twice.
        node.on.lang(this.onLangCallback);

        // Display initialization.
        this.displayForm = W.get('form', 'radioButtonForm');
        this.loadingDiv = W.add('div', this.displayForm);
        this.loadingDiv.innerHTML = this.getText('loading');

        this.loadLanguages();
    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayForm);
    };

    /**
     * ### LanguageSelector.setLanguage
     *
     * Sets language within the widget and globally and updates the display
     *
     * @param {string} langName shortName of language to be set
     * @param {boolean} updatePlayer If FALSE, the language is set only
     *   inside the widget, and no changes are made to the player object.
     *   Default: TRUE
     *
     * @see NodeGameClient.setLanguage
     */
    LanguageSelector.prototype.setLanguage = function(langName, updatePlayer) {

        if (this.usingButtons) {

            // Uncheck current language button and change className of label.
            if (this.currentLanguage !== null &&
                this.currentLanguage !== this.availableLanguages[langName] ) {

                this.optionsDisplay[this.currentLanguage].checked =
                    'unchecked';
                this.optionsLabel[this.currentLanguage].className =
                    'unselectedButtonLabel';
            }
        }

        // Set current language index.
        this.currentLanguage = langName;

        if (this.usingButtons) {
            // Check language button and change className of label.
            this.optionsDisplay[this.currentLanguage].checked = 'checked';
            this.optionsLabel[this.currentLanguage].className =
                'selectedButtonLabel';
        }
        else {
            this.displaySelection.value = this.currentLanguage;
        }

        // Update node.player.
        if (updatePlayer !== false) {
            node.setLanguage(this.availableLanguages[this.currentLanguage],
                             this.setUriPrefix, this.notifyServer);
        }
    };

    /**
     * ### LanguageSelector.updateAvailableLanguages
     *
     * Updates available languages asynchronously
     *
     * @param {object} options Optional. Configuration options
     */
    LanguageSelector.prototype.updateAvalaibleLanguages = function(options) {
        if (options && options.callback) {
            this.onLangCallbackExtension = options.callback;
        }
        node.socket.send(node.msg.create({
            target: "LANG",
            to: "SERVER",
            action: "get"
        }));
    };

    /**
     * ### LanguageSelector.loadLanguages
     *
     * Loads languages once from server
     *
     * @param {object} options Optional. Configuration options
     *
     * @see LanguageSelector.updateAvalaibleLanguages
     */
    LanguageSelector.prototype.loadLanguages = function(options) {
        if (!this.languagesLoaded) this.updateAvalaibleLanguages(options);
        else if (options && options.callback) options.callback();
    };

    /**
     * ### LanguageSelector.listeners
     *
     * Implements Widget.listeners
     */
    LanguageSelector.prototype.listeners = function() {
        var that;
        that = this;
        node.events.step.on('REALLY_DONE', function() {
            if (that.updatePlayer === 'ondone') {
                node.setLanguage(that.availableLanguages[that.currentLanguage],
                                 that.setUriPrefix, that.notifyServer);
            }
        });
    };

})(node);
