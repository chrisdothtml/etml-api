/*
 * File: tokenizer
 * Description: Takes a string of etml, crawls the source and
 * creates an array of tokens for it. Based off the Jade Lexer.
 * Jade Lexer: https://github.com/jadejs/jade-lexer
 */

/*
TOKEN TYPES/STRUCTURE

text
	val: String
comment
	type: String (startBlock, endBlock)
include
	url: String
variable
	action: String (define, call)
	name: String
	value: String
	scope: String (global, filename)
eos
 */

/*
TODO

-built-in tags
-line numbers
-standardize warnings/errors
	-possibly merge warnings into errors
-work out feature disabling (comments: false)
-variable scope
-figure out how to maybe have token children (variable calls within variable definitions, etc)
	-possibly just add a check to each that apply and make format for children
 */
'use strict';
var Tokenizer;

module.exports = function (str, filename, options) {
	var tokenizer;
	tokenizer = new Tokenizer(str, filename, options);
	return tokenizer.getTokens();
};

module.exports.Tokenizer = Tokenizer;


/*
 * Tokenizer()
 * Initializes `Tokenizer` with the provided `str`
 */

Tokenizer = function (str, filename, options) {
	str = str.replace(/^\uFEFF/, '');
	this.options = options;
	this.input = str.replace(/\r\n|\r/g, '\n');
	this.origInput = this.input;
	this.filename = filename;
	this.tokens = [];
	return this.done = false;
};

Tokenizer.prototype = {
	constructor: Tokenizer,

	/*
	 * warn()
	 * Logs a warning message if warning is enabled
	 */
	warn: function (message) {
		if (this.options.warnings) {
			return console.log('WARNING: ' + message);
		}
	},

	/*
	 * error()
	 * Throws an error message
	 */
	error: function (message) {
		var err;
		err = 'ERROR: ' + message;
		throw err;
	},

	/*
	 * token()
	 * Creates a token with provided type and attributes
	 */
	token: function (type, attrs) {
		if (attrs != null) {
			return {
				type: type,
				attrs: attrs
			};
		} else {
			return {
				type: type
			};
		}
	},

	/*
	 * consume()
	 * Removes the matched token so the tokenizer
	 * can continue with the rest of the string
	 */
	consume: function (length) {
		return this.input = this.input.substr(length);
	},

	/*
	 * matches()
	 * Checks for matching single/double quotes or
	 * curly brackets in expressions
	 */
	matches: function (expr) {
		var capture, captures;
		if (captures = /"[^\n]*/.exec(expr)) {
			if (!(capture = /"[^\n]*"/.exec(captures[0]))) {
				this.error('Unmatched double quote "');
			}
		}
		if (captures = /'[^\n]*/.exec(expr)) {
			if (!(capture = /'[^\n]*'/.exec(captures[0]))) {
				this.error('Unmatched single quote \'');
			}
		}
		if (captures = /\{[^\n]*/.exec(expr)) {
			if (!(capture = /\{[^\n]*\}/.exec(captures[0]))) {
				this.error('Unmatched curly bracket {');
			}
		}
		return true;
	},

	/*
	 * eos()
	 * Decides what happens when the end of the src
	 * has been reached
	 */
	eos: function () {
		if (this.input.length) {
			return;
		}
		this.tokens.push(this.token('eos'));
		this.done = true;
		return true;
	},

	/*
	 * blank()
	 * Blank line
	 */
	blank: function () {
		var captures;
		if (captures = /^\n[ \t]*\n/.exec(this.input)) {
			this.consume(captures[0].length - 1);
			this.tokens.push(this.token('text', {
				value: '\n'
			}));
			return true;
		}
	},

	/*
	 * scripts()
	 * Check for script tags since etml syntax is
	 * similar to Javascript
	 */
	scripts: function () {
		var captures;
		if (captures = /^<script[\s\S]*\/script>/.exec(this.input)) {
			this.consume(captures[0].length);
			this.tokens.push(this.token('text', {
				value: captures[0]
			}));
			return true;
		}
	},

	/*
	 * comment()
	 * Inline and block comments
	 */
	comment: function () {
		var captures;
		if (this.options.comments) {
			if (captures = /^(\\?\/\/).*/.exec(this.input)) {
				if (captures[0].substring(0, 1) === '\\') {
					this.consume(captures[1].length);
					this.tokens.push(this.token('test', {
						value: captures[1].substr(1)
					}));
				} else {
					this.consume(captures[0].length);
				}
				return true;
			}
			if (captures = /^\\?\/\*/.exec(this.input)) {
				if (captures[0].substring(0, 1) === '\\') {
					this.tokens.push(this.token('text', {
						value: captures[0].substr(1)
					}));
				} else {
					this.tokens.push(this.token('comment', {
						type: 'blockStart'
					}));
				}
				this.consume(captures[0].length);
				return true;
			}
			if (captures = /^\\?\*\//.exec(this.input)) {
				if (captures[0].substring(0, 1) === '\\') {
					this.tokens.push(this.token('text', {
						value: captures[0].substr(1)
					}));
				} else {
					this.tokens.push(this.token('comment', {
						type: 'blockEnd'
					}));
				}
				this.consume(captures[0].length);
				return true;
			}
		}
	},

	/*
	 * include()
	 * File includes
	 */
	include: function () {
		var captures;
		if (captures = /^\\?@include ?['"]([\w\.\/-]*)['"];?/.exec(this.input)) {
			if (captures[0].substring(0, 1) === '\\') {
				this.tokens.push(this.token('text', {
					value: captures[0].substr(1)
				}));
			} else {
				if (captures[0].substr(-1) === ';') {
					this.matches(captures[0]);
					this.tokens.push(this.token('include', {
						url: captures[1]
					}));
				} else {
					this.warn('Missing semicolon ; for @include');
					this.tokens.push(this.token('text', {
						value: captures[0]
					}));
				}
			}
			this.consume(captures[0].length);
			return true;
		}
	},

	/*
	 * variableDefine()
	 * Variable definitions
	 */
	variableDefine: function () {
		var captures;
		if (captures = /^\\?\$([\w-]+): ?['"]([^'";]*)['"]?;?/.exec(this.input)) {
			if (captures[0].substring(0, 1) === '\\') {
				this.tokens.push(this.token('text', {
					value: captures[0].substr(1)
				}));
			} else {
				if (captures[0].substr(-1) === ';') {
					this.matches(captures[0]);
					this.tokens.push(this.token('variable', {
						action: 'define',
						name: captures[1],
						value: captures[2]
					}));
				} else {
					this.warn('Missing semicolon ; for variable definition');
					this.tokens.push(this.token('text', {
						value: captures[0]
					}));
				}
			}
			this.consume(captures[0].length);
			return true;
		}
	},

	/*
	 * variableCall()
	 * Variable calls
	 */
	variableCall: function () {
		var captures;
		if (captures = /^\\?\{ ?\$([\w-]+) ?\}?/.exec(this.input)) {
			if (captures[0].substring(0, 1) === '\\') {
				this.tokens.push(this.token('text', {
					value: captures[0].substr(1)
				}));
			} else {
				this.matches(captures[0]);
				this.tokens.push(this.token('variable', {
					action: 'call',
					name: captures[1]
				}));
			}
			this.consume(captures[0].length);
			return true;
		}
	},

	/*
	 * text()
	 * Regular text (or HTML) that isn't a part
	 * of any etml-related expression
	 */
	text: function () {
		var captures, regex;
		if (this.options.comments) {
			regex = /((?!\\?\/\/|\\?\/\*|\\?\*\/|\\?@include\s?['"][\w\.\/-]*['"];?|\\?\$[\w-]+:\s?['"][^'"]*['"];?|\\?\{\$[\w-]+\}?|<script).)*\n*/;
		} else {
			regex = /((?!\\?@include\s?['"][\w\.\/-]*['"];?|\\?\$[\w-]+:\s?['"][^'"]*['"];?|\\?\{\$[\w-]+\}?|<script).)*\n*/;
		}
		if (captures = regex.exec(this.input)) {
			if (captures[0].length) {
				this.consume(captures[0].length);
				this.tokens.push(this.token('text', {
					value: captures[0]
				}));
				return true;
			}
		}
	},

	/*
	 * fail()
	 * Fails to match any other type
	 */
	fail: function () {
		console.log(this.tokens);
		return this.error('Unexpected text found');
	},

	/*
	 * advance()
	 * Moves to the next token
	 */
	advance: function () {
		return this.eos() || this.blank() || this.scripts() || this.comment() || this.include() || this.variableDefine() || this.variableCall() || this.text() || this.fail();
	},

	/*
	 * getTokens()
	 * Returns array of tokens for the source
	 */
	getTokens: function () {
		while (!this.done) {
			this.advance();
		}
		return this.tokens;
	}
};