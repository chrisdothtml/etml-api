###
 * File: parser
 * Description: Runs input through tokenizer and converts
 * to writable HTML
###

'use strict'

# external modules
fs = require 'fs'
path = require 'path'

# etml modules
error = require './error'
tokenize = require './tokenizer' 

module.exports = (file, options) ->
	parser = new Parser file, options
	parser.parse()

module.exports.Parser = Parser

###
 * Parser()
 * Initializes `Parser` with the provided file and options
###
Parser = (file, options) ->
	@file = file
	@options = options

	@tokens = tokenize file, options
	@variables = {global: {}}
	@included = []

	return null

Parser.prototype =
	constructor: Parser

	###
	 * error()
	 * Sends to the error module
	###
	err: (message) ->
		console.log @file
		error message, @file

	###
	 * includeFile()
	 * Retreives a file include's contents and returns an
	 * array of tokens from the included file
	###
	includeFile: (file) ->
		console.log 'including file...'

	###
	 * parse()
	 * Parses an array of tokens
	###
	parse: ->
		self = @
		#console.log @tokens

		# unordered parsing
		@tokens = @tokens.map (token) ->

			# clear empty lines
			if token.type is 'text'
				if token.attrs.value is '\n' then return false

			if token.type is 'eos' then return false

			# define variables
			else if token.type is 'variable' and token.attrs.action is 'define'

				self.variables.global[token.attrs.name] = token.attrs.value
				return false

			# includes
			else if token.type is 'include'

				# if url hasn't been included
				if self.included.indexOf(token.attrs.url) is -1
					console.log 'import ' + token.attrs.url

				# mark this token for deletion (TEMPORARY)
				return false

			else return token

		# filter out false tokens
		.filter (token) ->
			return token

		# ordered parsing
		output = ''
		for token in @tokens

			# text
			if token.type is 'text' then output += token.attrs.value

			# variable call
			else if token.type is 'variable' and token.attrs.action is 'call'

				if self.variables.global[token.attrs.name]
					output += self.variables.global[token.attrs.name]

				else @err 'No such variable: ' + token.attrs.name

			# short tag
			else if token.type is 'short-tag'

				# site
				if token.attrs.tag is 'site'
					for attr, value of token.attrs.attrs

						# title
						if attr is 'title'
							output += "<title>#{value}</title>\n"

						# responsive
						if attr is 'responsive'
							output += "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"

						# description
						if attr is 'description'
							output += "<meta name=\"description\" content=\"#{value}\">\n"

				# css
				else if token.attrs.tag is 'css'

					attrs = ''
					for attr, value of token.attrs.attrs
						if attr is 'url' then name = 'href' else name = attr
						attrs += "#{name}=\"#{value}\""

					output += "<link #{attrs} rel=\"stylesheet\" type=\"text/css\">\n"

				# js
				else if token.attrs.tag is 'js'

					attrs = ''
					for attr, value of token.attrs.attrs
						if attr is 'url' then name = 'src' else name = attr
						attrs += "#{name}=\"#{value}\""

					output += "<script #{attrs} type=\"text/javascript\"></script>\n"

			else @err 'Unrecognized token ' + JSON.stringify token

		#return null
		return output