(function(node) {
    "use strict";

    node.widgets.register('LanguageSelector', LanguageSelector);

    var J = node.JSUS,
        game = node.game;

    // ## Meta-data

    LanguageSelector.version = '0.2.0';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allow to change language.';
    LanguageSelector.title = 'Language'; // change at runtime?
    LanguageSelector.className = 'languageselector';

    // ## Dependencies

    LanguageSelector.dependencies = {
        JSUS: {},
        Game: {}
    };

    function LanguageSelector(options) {
        this.options = options;

        this.availableLanguages = null;
        this.currentLanguageIndex = null;

        this.displayForm = null;
        this.buttonLabels = [];
        this.buttons = [];
        this.loadingDiv = null;
        this.languagesLoaded = false;


        this.onLangCallback = null;
        this.onLangCallbackExtension = null;

        this.init(this.options);
    }

    LanguageSelector.prototype.init = function(options) {
        var that = this;

        J.mixout(options, this.options);
        this.options = options;

        // Get language info.
        this.onLangCallback = function(msg) {
            var i = 0;

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

        node.on.lang(this.onLangCallback);

        // Display initialization.
        this.displayForm = node.window.getElement('form','radioButtonForm');
        this.loadingDiv = node.window.addDiv(this.displayForm);
        this.loadingDiv.innerHTML = 'Loading language information...';

//        this.updateAvalaibleLanguages();

    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayForm);
    };

    LanguageSelector.prototype.setLanguage = function(property, value) {

        // If only one argument is provided we assume it to be the index
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
