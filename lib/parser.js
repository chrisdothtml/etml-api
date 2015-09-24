/*
 * File: parser
 * Description: Runs input through tokenizer and converts
 * to writable HTML
 */
'use strict';
var Parser, error, fs, path, tokenize;

fs = require('fs');

path = require('path');

error = require('./error');

tokenize = require('./tokenizer');

module.exports = function (file, options) {
	var parser;
	parser = new Parser(file, options);
	return parser.parse();
};

module.exports.Parser = Parser;


/*
 * Parser()
 * Initializes `Parser` with the provided file and options
 */

Parser = function (file, options) {
	this.file = file;
	this.options = options;
	this.tokens = tokenize(file, options);
	this.variables = {
		global: {}
	};
	this.included = [];
	return null;
};

Parser.prototype = {
	constructor: Parser,

	/*
	 * error()
	 * Sends to the error module
	 */
	err: function (message) {
		console.log(this.file);
		return error(message, this.file);
	},

	/*
	 * includeFile()
	 * Retreives a file include's contents and returns an
	 * array of tokens from the included file
	 */
	includeFile: function (file) {
		return console.log('including file...');
	},

	/*
	 * parse()
	 * Parses an array of tokens
	 */
	parse: function () {
		var attr, attrs, i, len, name, output, ref, ref1, ref2, ref3, self, token, value;
		self = this;
		this.tokens = this.tokens.map(function (token) {
			if (token.type === 'text') {
				if (token.attrs.value === '\n') {
					return false;
				}
			}
			if (token.type === 'eos') {
				return false;
			} else if (token.type === 'variable' && token.attrs.action === 'define') {
				self.variables.global[token.attrs.name] = token.attrs.value;
				return false;
			} else if (token.type === 'include') {
				if (self.included.indexOf(token.attrs.url) === -1) {
					console.log('import ' + token.attrs.url);
				}
				return false;
			} else {
				return token;
			}
		}).filter(function (token) {
			return token;
		});
		output = '';
		ref = this.tokens;
		for (i = 0, len = ref.length; i < len; i++) {
			token = ref[i];
			if (token.type === 'text') {
				output += token.attrs.value;
			} else if (token.type === 'variable' && token.attrs.action === 'call') {
				if (self.variables.global[token.attrs.name]) {
					output += self.variables.global[token.attrs.name];
				} else {
					this.err('No such variable: ' + token.attrs.name);
				}
			} else if (token.type === 'short-tag') {
				if (token.attrs.tag === 'site') {
					ref1 = token.attrs.attrs;
					for (attr in ref1) {
						value = ref1[attr];
						if (attr === 'title') {
							output += "<title>" + value + "</title>\n";
						}
						if (attr === 'responsive') {
							output += "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n";
						}
						if (attr === 'description') {
							output += "<meta name=\"description\" content=\"" + value + "\">\n";
						}
					}
				} else if (token.attrs.tag === 'css') {
					attrs = '';
					ref2 = token.attrs.attrs;
					for (attr in ref2) {
						value = ref2[attr];
						if (attr === 'url') {
							name = 'href';
						} else {
							name = attr;
						}
						attrs += name + "=\"" + value + "\"";
					}
					output += "<link " + attrs + " rel=\"stylesheet\" type=\"text/css\">\n";
				} else if (token.attrs.tag === 'js') {
					attrs = '';
					ref3 = token.attrs.attrs;
					for (attr in ref3) {
						value = ref3[attr];
						if (attr === 'url') {
							name = 'src';
						} else {
							name = attr;
						}
						attrs += name + "=\"" + value + "\"";
					}
					output += "<script " + attrs + " type=\"text/javascript\"></script>\n";
				}
			} else {
				this.err('Unrecognized token ' + JSON.stringify(token));
			}
		}
		return output;
	}
};