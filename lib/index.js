/*
 * File: index
 * Description: Handles the data before and after it is parsed
 */
'use strict';
var beautify, defaults, parse;

beautify = require('js-beautify').html;

defaults = require('defaults');

parse = require('./parser');

module.exports = {

	/*
	 * compile()
	 * Handles the data before and after it is parsed
	 */
	compile: function (file, options, callback) {
		var output;
		({
			options: defaults(options, {
				debug: false,
				warnings: true,
				comments: true,
				variables: true,
				includes: true,
				shortTags: true,
				indent_level: 1,
				indent_with_tabs: true,
				indent_inner_html: true,
				unescape_strings: true
			})
		});
		output = parse(file, options);
		output = beautify(output, {
			indent_level: options.indent_level,
			indent_with_tabs: options.indent_with_tabs,
			indent_inner_html: options.indent_inner_html,
			unescape_strings: options.unescape_strings
		});
		return callback(null, output);
	}
};