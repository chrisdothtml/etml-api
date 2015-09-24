'use strict'

var etmlapi = require('./')

var src = '// File: contact\n// General Variables\n$name: \'Chris\';\n$this: \'etml\';\n\n\// Site Variables\n$site-title: \'Awesome Website\';\n$site-desc: \'A wonderful website built using {$this}\';\n\n<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<site title="{$site-title}" responsive="true" description="{$site-desc}" />\n\n\t\t// Vendor Styles\n\t\t<css id="vendor-css" url="vendor.min.css" />\n\n\t\t// Site Styles\n\t\t<css url="core.min.css" />\n\t</head>\n\t<body>\n\n\t\t@include \'inc/_header.etml\';\n\n\t\t<h1>Hi, {$name}! Meet {$this}.</h1>\n\n\t\t// Vendor Scripts\n\t\t<js id="vendor-js" url="vendor.min.js" />\n\n\t\t// Site Scripts\n\t\t<js url="core.min.js" />\n\t</body>\n</html>'

var file = {contents: src}
var options = {debug: true}

etmlapi.compile(file, options, function(err, output) {
	console.log(output)
});