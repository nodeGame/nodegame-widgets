(function (node) {

	var widget = node.widgets.register('GameSummary');
	

// ## Defaults
	
	widget.defaults.fieldset = {
		legend: 'Game Summary',
	};
	
// ## Meta-data
	
	widget.id = 'gamesummary';
	widget.name = 'Game Summary';
	widget.version = '0.3';
	widget.description = 'Show the general configuration options of the game.';
	
	widget.constructor = function (options) {
		this.summaryDiv = null;
	}
	
	widget.append = function (root) {
		this.root = root;
		this.summaryDiv = node.window.addDiv(root);
		this.writeSummary();
		return root;
	};
	
	widget.writeSummary = function (idState, idSummary) {
		var gName = document.createTextNode('Name: ' + node.game.name),
			gDescr = document.createTextNode('Descr: ' + node.game.description),
			gMinP = document.createTextNode('Min Pl.: ' + node.game.minPlayers),
			gMaxP = document.createTextNode('Max Pl.: ' + node.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.root, this.summaryDiv, idSummary);
	};

})(node);