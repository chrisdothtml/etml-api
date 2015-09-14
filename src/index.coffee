###
 * File: index
 * Description: Handles the data before and after it is tokenized
 * and parsed
###

'use strict'

# external modules
defaults = require 'defaults'

# etml modules
parse = require 'parser'

module.exports =

	###
	 * compile()
	 * Handles the data before and after it is tokenized
	 * and parsed
	###
	compile: (file, options, callback) ->

		options: defaults options,
			# etml defaults
			warnings: true
			comments: false
			variables: true
			includes: true
			shortTags: true
			# JS Beautify defaults
			indent_level: 1,
			indent_with_tabs: true,
			unescape_strings: true

		output = parse file, options

		# beautify output before sending back
		output = beautify output,
			indent_level: options.indent_level
			indent_with_tabs: options.indent_with_tabs
			unescape_strings: options.unescape_strings

		callback null, file.contents