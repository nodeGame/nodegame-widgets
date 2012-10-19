(function (exports) {

	exports.GameSummary	= GameSummary;
	
	GameSummary.id = 'gamesummary';
	GameSummary.name = 'Game Summary';
	GameSummary.version = '0.3';
	GameSummary.description = 'Show the general configuration options of the game.';
	
	function GameSummary(options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Game Summary'
		};
		this.summaryDiv = null;
	}
	
	// TODO: Write a proper INIT method
	GameSummary.prototype.init = function () {};
	
	GameSummary.prototype.append = function (root) {
		this.root = root;
		this.summaryDiv = node.window.addDiv(root);
		this.writeSummary();
		return root;
	};
	
	GameSummary.prototype.getRoot = function () {
		return this.root;
	};
	
	GameSummary.prototype.writeSummary = function (idState, idSummary) {
		var gName = document.createTextNode('Name: ' + this.game.name);
		var gDescr = document.createTextNode('Descr: ' + this.game.description);
		var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
		var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.root, this.summaryDiv, idSummary);
	};
	
	GameSummary.prototype.listeners = function() {}; 

})(node.window.widgets);