###
 * File: tokenizer
 * Description: Takes a string of etml, crawls the source and
 * creates an array of tokens for it. Based off the Jade Lexer.
 * Jade Lexer: https://github.com/jadejs/jade-lexer
###
###
TOKEN TYPES/STRUCTURE

text
	val: String
comment
	type: String (startBlock, endBlock)
include
	url: String
short-tag
	tag: String
	attrs: Object
variable
	action: String (define, call)
	file: Object
	name: String
	value: String
	scope: String (global, filename)
eos
###

###
TODO

-line numbers
-work out feature disabling (comments: false)
-variable scope
-figure out how to maybe have token children (variable calls within variable definitions, etc)
	-possibly just add a check to each that apply and make format for children
###

'use strict'

# etml modules
error = require './error'

module.exports = (file, options) ->
	tokenizer = new Tokenizer file, options
	tokenizer.tokenize()

module.exports.Tokenizer = Tokenizer

###
 * Tokenizer()
 * Initializes `Tokenizer` with the provided file and options
###
Tokenizer = (file, options) ->
	@file = file
	@options = options
	@input = file.contents.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')

	@tokens = []
	@done = false

	return null

Tokenizer.prototype =
	constructor: Tokenizer

	###
	 * error()
	 * Sends to the error module
	###
	error: (message) ->
		error message, @file

	###
	 * token()
	 * Creates a token with provided type and attributes
	###
	token: (type, attrs) ->
		if attrs?
			return {type: type, attrs: attrs}
		else return {type: type}

	###
	 * consume()
	 * Removes the matched token so the tokenizer
	 * can continue with the rest of the string
	###
	consume: (length) ->

		@input = @input.substr length

	###
	 * matches()
	 * Checks for matching single/double quotes or
	 * curly brackets in expressions
	###
	matches: (expr) ->

		# ""
		if captures = /"[^\n]*/.exec expr
			if not capture = /"[^\n]*"/.exec captures[0]
				@error 'Unmatched double quote "'

		# ''
		if captures = /'[^\n]*/.exec expr
			if not capture = /'[^\n]*'/.exec captures[0]
				@error 'Unmatched single quote \''

		# {}
		if captures = /\{[^\n]*/.exec expr
			if not capture = /\{[^\n]*\}/.exec captures[0]
				@error 'Unmatched curly bracket {'

		return true

	###
	 * eos()
	 * Decides what happens when the end of the src
	 * has been reached
	###
	eos: ->
		if @input.length then return
		@tokens.push @token 'eos'
		@done = true
		return true

	###
	 * blank()
	 * Blank line
	###
	blank: ->
		if captures = /^\n[ \t]*\n/.exec @input
			@consume captures[0].length - 1
			@tokens.push @token 'text',
				value: '\n'
			return true

	###
	 * scripts()
	 * Check for script tags since etml syntax is
	 * similar to Javascript
	###
	scripts: ->
		if captures = /^<script[\s\S]*\/script>/.exec @input
			@consume captures[0].length
			@tokens.push @token 'text',
				value: captures[0]
			return true

	###
	 * comment()
	 * Inline and block comments
	###
	comment: ->
		if @options.comments

			# inline
			if captures = /^(\\?\/\/).*/.exec @input

				if captures[0].substring(0,1) is '\\'
					@consume captures[1].length
					@tokens.push @token 'test',
						value: captures[1].substr 1
				else
					@consume captures[0].length

				return true

			# block start
			if captures = /^\\?\/\*/.exec @input

				if captures[0].substring(0,1) is '\\'
					@tokens.push @token 'text',
						value: captures[0].substr 1
				else
					@tokens.push @token 'comment',
						type: 'blockStart'

				@consume captures[0].length
				return true

			# block end
			if captures = /^\\?\*\//.exec @input

				if captures[0].substring(0,1) is '\\'
					@tokens.push @token 'text',
						value: captures[0].substr 1
				else
					@tokens.push @token 'comment',
						type: 'blockEnd'

				@consume captures[0].length
				return true

	###
	 * include()
	 * File includes
	###
	include: ->
		if captures = /^\\?@include ?['"]([\w\.\/-]*)['"];?/.exec @input

			if captures[0].substring(0,1) is '\\'
				@tokens.push @token 'text',
					value: captures[0].substr 1
			else

				if captures[0].substr(-1) is ';'
					@matches captures[0]
					@tokens.push @token 'include',
						url: captures[1]
				else
					@error 'Missing semicolon ; for @include'
					@tokens.push @token 'text',
						value: captures[0]
				
			@consume captures[0].length
			return true

	###
	 * tags()
	 * Built-in tags
	###
	tags: ->
		if captures = /^<([\w]*) ([^\n]*)>/.exec @input
			save = remove = []

			if captures[1] is 'site' then save = ['title', 'responsive', 'description']
			else if captures[1] is 'css' then remove = ['rel', 'type', 'href']
			else if captures[1] is 'js' then remove = ['type', 'src']

			attrs = {}
			regex = /([\w-]+)=['"]?([^'"\n]+)['"]?/g
			while capture = regex.exec captures[0]
				attr = capture[1]
				value = capture[2]

				if save.indexOf(attr) > -1 or remove.indexOf(attr) < 0
					attrs[attr] = value

			@tokens.push @token 'short-tag',
				tag: captures[1]
				attrs: attrs

			@consume captures[0].length
			return true

	###
	 * variableDefine()
	 * Variable definitions
	###
	variableDefine: ->
		if captures = /^\\?\$([\w-]+): ?['"]([^'";\n]*)['"]?;?/.exec @input

			if captures[0].substring(0,1) is '\\'
				@tokens.push @token 'text',
					value: captures[0].substr 1
			else
				
				if captures[0].substr(-1) is ';'
					@matches captures[0]
					@tokens.push @token 'variable',
						action: 'define'
						name: captures[1]
						value: captures[2]
				else
					@error 'Missing semicolon ; for variable definition'
					@tokens.push @token 'text',
						value: captures[0]

			@consume captures[0].length
			return true

	###
	 * variableCall()
	 * Variable calls
	###
	variableCall: ->
		if captures = /^\\?\{ ?\$([\w-]+) ?\}?/.exec @input

			if captures[0].substring(0,1) is '\\'
				@tokens.push @token 'text',
					value: captures[0].substr 1
			else
				@matches captures[0]
				@tokens.push @token 'variable',
					file: @file
					action: 'call'
					name: captures[1]

			@consume captures[0].length
			return true

	###
	 * text()
	 * Regular text (or HTML) that isn't a part
	 * of any etml-related expression
	###
	text: ->
		#comments = if @options.comments then '\\\\?\\/\\/|\\\\?\\/\\*|\\\\?\\*\\/|' else ''
		#rest = '\\\\?@include\\s?[\'"][\\w\\.\\/-]*[\'"];?|\\\\?\\$[\\w-]+:\\s?[\'"][^\'"]*[\'"];?|\\\\?\\{\\$[\\w-]+\\}?|#<script'
		#regex = new RegExp '^((?!' + comments + rest + ').)*\\n'

		if @options.comments
			regex = ///((
				?!\\?\/\/
				|\\?\/\*
				|\\?\*\/
				|\\?@include\s?['"][\w\.\/-]*['"];?
				|<(?:js|css|site)[^\n]*>
				|\\?\$[\w-]+:\s?['"][^'"]*['"];?
				|\\?\{\$[\w-]+\}?
				|<script
			).)*\n*///
		else
			regex = ///((
				?!\\?@include\s?['"][\w\.\/-]*['"];?
				|\\?\$[\w-]+:\s?['"][^'"]*['"];?
				|\\?\{\$[\w-]+\}?
				|<script
			).)*\n*///

		if captures = regex.exec @input
			if captures[0].length
				@consume captures[0].length
				@tokens.push @token 'text',
					value: captures[0]
				return true

	###
	 * fail()
	 * Fails to match any other type
	###
	fail: ->
		if @options.debug then console.log @tokens
		@error 'Unexpected text found'

	###
	 * advance()
	 * Moves to the next token
	###
	advance: ->
		return \
			@eos() or
			@blank() or
			@scripts() or
			@comment() or
			@include() or
			@tags() or
			@variableDefine() or
			@variableCall() or
			@text() or
			@fail()

	###
	 * tokenize()
	 * Returns array of tokens for the source
	###
	tokenize: ->
		while not @done then @advance()
		return @tokens