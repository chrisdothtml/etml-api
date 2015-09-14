module.exports = (grunt) ->

	grunt.initConfig
		pkg: grunt.file.readJSON 'package.json'

		build: 'src'
		dist: 'lib'

		coffee:
			options:
				bare: true
			src:
				expand: true
				cwd: '<%=build%>/'
				src: '*.coffee'
				dest: '<%=dist%>/'
				ext: '.js'

		jsbeautifier:
			options:
				js:
					jslintHappy: true
					indentWithTabs: true
					endWithNewline: false
			lib:
				expand: true
				src: '<%=dist%>/*.js'
				
		watch:
			javascript:
				files: ['<%=build%>/*.coffee']
				tasks: ['coffee','jsbeautifier']

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-jsbeautifier'

	grunt.registerTask 'all', ['coffee','jsbeautifier']
	grunt.registerTask 'default', ['watch']