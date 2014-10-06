(function(node) {
    "use strict";

    node.widgets.register('LanguageSelector', LanguageSelector);

    var J = node.JSUS;

    // ## Meta-data

    LanguageSelector.version = '0.1.0';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allow to change language.';
    LanguageSelector.title = 'Language'; // change at runtime?
    LanguageSelector.className = 'languageselector';

    // ## Dependencies

    LanguageSelector.dependencies = {
        JSUS: {}
    };

    function LanguageSelector(options) {
        this.options = options;

        this.availableLanguages = null;
        this.displayForm = null;
        this.buttonLabels = [];
        this.buttons = [];

        this.currentLanguageIndex = null;
        this.languagePath = null;

        this.init(this.options);
    }

    LanguageSelector.prototype.init = function(options) {
        var i = 0;

        J.mixout(options, this.options);
        this.options = options;

        this.updateAvalaibleLanguages(options);

        // Display initialization.
        this.displayForm = node.window.getElement('form','radioButtonForm');

        debugger
        for(i = 0; i < this.availableLanguages.length; ++i) {

            this.buttonLabels[i] = node.window.getElement('label', 'label' + i,
                { for: 'radioButton' + i });

            this.buttons[i] = node.window.getElement('input',
                'radioButton' + i, {
                    type: 'radio',
                    name: 'languageButton',
                    value: this.availableLanguages[i].name,
                    onClick: 'node.game.lang.setLanguage('+ i + ')'
                }
            );
            this.buttonLabels[i].appendChild(this.buttons[i]);
            this.buttonLabels[i].appendChild(
                document.createTextNode(this.availableLanguages[i].nativeName));
            node.window.addElement('br', this.buttonLabels[i]);
            this.buttonLabels[i].className = 'unselectedButtonLabel';
            this.displayForm.appendChild(this.buttonLabels[i]);
        }

        this.setLanguage('shortName','en');
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

        // Set `langPath`.
        this.languagePath =
            this.availableLanguages[this.currentLanguageIndex].shortName + '/';

        // Reload current page (only document inside iframe)
        // TODO

    };

    LanguageSelector.prototype.updateAvalaibleLanguages = function(options) {
        var that = this;

        // TODO:Synchronize
        node.getJSON('languages.json',
            function(languages) {
                that.availableLanguages2 = languages; debugger
            }
        );



        this.availableLanguages =
        [
           {
        name: "English",
        "nativeName": "English",
        "shortName": "en",
        "flag": ""
    },
    {
        "name": "German",
        "nativeName": "Deutsch",
        "shortName": "de",
        "flag": ""
    },
    {
        "name": "French",
        "nativeName": "Français",
        "shortName": "fr",
        "flag": ""
    }
        ];
        debugger;
    };

})(node);
