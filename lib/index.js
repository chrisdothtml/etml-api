/*
 * File: index
 * Description: Handles the data before and after it is tokenized
 * and parsed
 */
'use strict';
var defaults, parse;

defaults = require('defaults');

parse = require('parser');

module.exports = {

	/*
	 * compile()
	 * Handles the data before and after it is tokenized
	 * and parsed
	 */
	compile: function (file, options, callback) {
		var output;
		({
			options: defaults(options, {
				warnings: true,
				comments: false,
				variables: true,
				includes: true,
				shortTags: true,
				indent_level: 1,
				indent_with_tabs: true,
				unescape_strings: true
			})
		});
		output = parse(file, options);
		output = beautify(output, {
			indent_level: options.indent_level,
			indent_with_tabs: options.indent_with_tabs,
			unescape_strings: options.unescape_strings
		});
		return callback(null, file.contents);
	}
};