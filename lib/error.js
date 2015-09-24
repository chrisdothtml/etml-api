/*
 * File: error
 * Description: Handles all errors.
 */
'use strict';
module.exports = function (message, file) {
	var err, src;
	src = '';
	if (file.src) {
		src = ' in ' + file.src;
	}
	err = 'ERROR: ' + message + src;
	throw err;
};