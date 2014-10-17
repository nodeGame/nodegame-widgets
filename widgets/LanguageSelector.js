/**
 * # VisualRound widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Manages and displays information about languages available and selected.
 *
 * www.nodegame.org
 * ---
 */
 (function(node) {

    "use strict";

    node.widgets.register('LanguageSelector', LanguageSelector);

    var J = node.JSUS,
        game = node.game;

    // ## Meta-data

    LanguageSelector.version = '0.2.0';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allows to change language.';
    LanguageSelector.title = 'Language';
    LanguageSelector.className = 'languageselector';

    // ## Dependencies

    LanguageSelector.dependencies = {
        JSUS: {},
        Game: {}
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
         * Array containing an object per availble language
         *
         * The language object contains at least the following properties:
         *
         * - `name`: Name of the language in English.
         * - `nativeName`: Native name of the language
         * - `shortName`: An abbreviation for the language, also determines the
         *  path to the context files for this language.
         *
         * @see Player.lang
         */
        this.availableLanguages = null;

        /**
         * ### LanguageSelector.currentLanguageIndex
         *
         * A numeral indicating the position of the currently used language
         *
         * @see LanguageSelector.availableLanguages
         */
        this.currentLanguageIndex = null;

        /**
         * ### LanguageSelector.displayForm
         *
         * The form in which the widget displays the language information
         */
        this.displayForm = null;

        /**
         * ### LanguageSelector.buttonLabels
         *
         * Array containing the labels for the language selection buttons
         */
        this.buttonLabels = [];

        /**
         * ### LanguageSelector.buttons
         *
         * Array containing the buttons for the language selection
         */
        this.buttons = [];

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
         * ### LanguageSelector.onLangCallback
         *
         * Function to be called when languages have been loaded
         *
         * Initializes form displaying the information as well as the buttons
         * and their labels. Initializes language to English.
         * Forwards to `LanguageSelector.onLangCallbackExtension` at the very
         * end.
         *
         * @see LanguageSelector.setLanguage
         */
        this.onLangCallback = function(msg) {
            var i = 0;

            if (that.languagesLoaded) {
                return;
            }

            // Initialize widget.
            that.availableLanguages = msg.data;
            for (i = 0; i < msg.data.length; ++i) {

                that.buttonLabels[i] = node.window.getElement('label', 'label' +
                    i, { for: 'radioButton' + i });

                that.buttons[i] = node.window.getElement('input',
                    'radioButton' + i, {
                        type: 'radio',
                        name: 'languageButton',
                        value: msg.data[i].name,
                        onClick: 'node.game.lang.setLanguage('+ i + ')'
                    }
                );
                that.buttonLabels[i].appendChild(that.buttons[i]);
                that.buttonLabels[i].appendChild(
                    document.createTextNode(msg.data[i].nativeName));
                node.window.addElement('br', that.buttonLabels[i]);
                that.buttonLabels[i].className = 'unselectedButtonLabel';
                that.displayForm.appendChild(that.buttonLabels[i]);
            }

            that.loadingDiv.style.display = 'none';
            that.languagesLoaded = true;

            // Initialize to English.
            that.setLanguage('shortName','en');

            // Extension point.
            if (that.onLangCallbackExtension) {
                that.onLangCallbackExtension(msg);
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

        this.init(this.options);
    }

    /**
     * ## LanguageSelector.init
     *
     * Initializes the widget
     *
     * @see LanguageSelector.onLangCallback
     */
    LanguageSelector.prototype.init = function(options) {
        var that = this;

        J.mixout(options, this.options);
        this.options = options;

        // Register listener.
        node.on.lang(this.onLangCallback);

        // Display initialization.
        this.displayForm = node.window.getElement('form','radioButtonForm');
        this.loadingDiv = node.window.addDiv(this.displayForm);
        this.loadingDiv.innerHTML = 'Loading language information...';

        this.updateAvalaibleLanguages();
    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayForm);
    };

    /**
     * ## LanguageSelector.setLanguage
     *
     * Sets language and updates view and `Player.lang`
     *
     * @param property Indicates which language property to use as identifier.
     * @param value Indicates which language to select. If no value is provided,
     *  property is assumed to represent the index of the language.
     *
     */
    LanguageSelector.prototype.setLanguage = function(property, value) {

        // If only one argument is provided, assume it to be the index
        if (arguments.length == 2) {
            this.setLanguage(J.map(this.availableLanguages,
                function(obj){return obj[property];}).indexOf(value));
            return;
        }

        // Uncheck current language button and change className of label.
        if (this.currentLanguageIndex !== null &&
            this.currentLanguageIndex !== arguments[0] ) {
            this.buttons[this.currentLanguageIndex].checked = 'unchecked';
            this.buttonLabels[this.currentLanguageIndex].className =
                'unselectedButtonLabel';
        }

        // Set current language index.
        this.currentLanguageIndex = arguments[0];

        // Check language button and change className of label.
        this.buttons[this.currentLanguageIndex].checked = 'checked';
        this.buttonLabels[this.currentLanguageIndex].className =
            'selectedButtonLabel';

        // Update node.player
        node.player.lang = this.availableLanguages[this.currentLanguageIndex];
        node.player.lang.path = node.player.lang.shortName + '/';
    };

    /**
     * ## LanguageSelector.updateAvalaibleLanguages
     *
     * Updates available languages asynchronously
     */
    LanguageSelector.prototype.updateAvalaibleLanguages = function(options) {
        if (options) {
            if (options.callback) {
                this.onLangCallbackExtension = options.callback;
            }
        }
        node.socket.send(node.msg.create({
            target: "LANG",
            to: "SERVER",
            action: "get"}
        ));
    };

})(node);
