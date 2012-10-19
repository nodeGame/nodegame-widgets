// nodegame-widgets

(function (node) {

node.Widget = Widget;	
	
Widget.defaults;
	
function Widget() {}

Widget.prototype.listeners = function () {};

Widget.prototype.getRoot = function () {};

Widget.prototype.getValues = function () {};

Widget.prototype.append = function () {};

Widget.prototype.init = function () {};

Widget.prototype.getRoot = function () {};

Widget.prototype.listeners = function () {};

Widget.prototype.getAllValues = function () {};

Widget.prototype.highlight = function () {};

})(
	// Widgets works only in the browser environment.
	('undefined' !== typeof node) ? node : module.parent.exports.node
);