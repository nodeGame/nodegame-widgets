(function (node) {

    node.widgets.register('WaitScreen', WaitScreen);
	
// ## Defaults
	
    WaitScreen.defaults = {};
    WaitScreen.defaults.id = 'waiting';
    WaitScreen.defaults.fieldset = false;
    
// ## Meta-data
	
    WaitScreen.name = 'WaitingScreen';
    WaitScreen.version = '0.4.0';
    WaitScreen.description = 'Show a standard waiting screen';
    
    function WaitScreen (options) {
	this.id = options.id;
	
	this.text = {
            waiting: options.waitingText || 'Waiting for other players to be done...',
            stepping: options.steppingText || 'Initializing, game will start soon...'
        }

	this.waitingDiv = null;
    }
    
    function updateScreen(text) {
        if (!this.waitingDiv) {
	    this.waitingDiv = node.window.addDiv(document.body, this.id);
	}
	    
	if (this.waitingDiv.style.display === 'none'){
	    this.waitingDiv.style.display = '';
	}			
	
	this.waitingDiv.innerHTML = text;
    }

    function hideScreen() {
        if (this.waitingDiv) {
            if (this.waitingDiv.style.display === '') {
                this.waitingDiv.style.display = 'none';
            }
        }
    }

    WaitScreen.prototype.append = function(root) {
	return root;
    };
    
    WaitScreen.prototype.getRoot = function() {
	return this.waitingDiv;
    };
    
    WaitScreen.prototype.listeners = function() {
        var that = this;
        node.on('BEFORE_DONE', function(text) {
            updateScreen.call(that, text || that.text.waiting)
        });
	
        node.on('STEPPING', function(text) {
            updateScreen.call(that, text || that.text.stepping)
        });
               
	// It is supposed to fade away when a new state starts
        node.on('PLAYING', function(text) {
            hideScreen.call(that);
        });

        // It is supposed to fade away when a new state starts
        node.on('GAME_OVER', function(text) {
            hideScreen.call(that);
        });


    }; 
})(node);