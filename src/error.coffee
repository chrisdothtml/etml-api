###
 * File: error
 * Description: Handles all errors.
###

'use strict'

module.exports = (message, file) ->
	src = ''

	if file.src then src = ' in ' + file.src
	
	err = 'ERROR: ' + message + src
	throw err