var _ = require('../../../lib/alloy/underscore')._,
	styler = require('../styler'),
	U = require('../../../utils'),
	CU = require('../compilerUtils');

exports.parse = function(node, state) {
	return require('./base').parse(node, state, parse);
};

function parse(node, state, args) {
	var children = U.XML.getElementsFromNodes(node.childNodes),
		err = ['NavigationGroup must have only one child element, which must be a Window'];
		code = '';

	// NavigationGroup must have 1 window as a child
	if (children.length !== 1) {
		U.die(err);
	} 

	var child = children[0],
		childArgs = CU.getParserArgs(child),
		theNode = CU.validateNodeName(child, 'Ti.UI.Window'),
		windowSymbol;

	// generate the code for the Window first
	if (theNode) {
		code += CU.generateNodeExtended(child, state, {
			parent: {},
			post: function(node, state, args) {
				windowSymbol = state.parent.symbol;
			}
		});
	} else {
		err.unshift('Invalid NavigationGroup child "' + childArgs.fullname + '"');
		U.die(err);
	}

	// create navgroup with window 
	state.extraStyle = styler.createVariableStyle('window', windowSymbol);
	code += require('./default').parse(node, state).code;

	// Update the parsing state
	return {
		parent: {},
		styles: state.styles,
		code: code
	} 
}