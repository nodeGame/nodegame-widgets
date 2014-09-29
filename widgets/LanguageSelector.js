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
        this.displayDiv = null;

        this.currentLanguageIndex = null;
        this.languagePath = null;

        this.init(this.options);
    }

    LanguageSelector.prototype.init = function(options) {
        J.mixout(options, this.options);
        this.options = options;

        this.updateAvalaibleLanguages(options);

        this.setLanguage('shortName','en');

        this.displayDiv = node.window.getDiv();
        this.updateDisplay();
    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayDiv);
    };

    LanguageSelector.prototype.setLanguage = function(property, value) {
        var listProperty;

        // If only one argument is provided we assume it to be the index
        if (arguments.length == 1) {
            this.currentLanguageIndex = arguments[0];
        }
        else {
            listProperty = J.map(this.availableLanguages,
                 function(obj){return obj[property];});
            this.currentLanguageIndex = listProperty.indexOf(value);
        }

        // Set `langPath`.
        this.languagePath =
            this.availableLanguages[this.currentLanguageIndex].shortName + '/';
    };

    LanguageSelector.prototype.updateAvalaibleLanguages = function(options) {
        // TODO: Do this really!
        this.availableLanguages = [
                {
                    name: 'English',
                    nativeName: 'English',
                    shortName: 'en',
                    flag: ''
                },
                {
                    name: 'German',
                    nativeName: 'Deutsch',
                    shortName: 'de',
                    flag: ''
                },
                {
                    name: 'French',
                    nativeName: 'Français',
                    shortName: 'fr',
                    flag: ''
                }
        ];
    };

    LanguageSelector.prototype.updateDisplay = function() {
        this.displayDiv.innerHTML = this.availableLanguages[
            this.currentLanguageIndex].nativeName;
    };

})(node);
