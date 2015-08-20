module.exports = (grunt)->

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-mocha'
  grunt.loadNpmTasks 'grunt-browserify'

  grunt.initConfig
    coffeelint:
      app:
        files:
          src: [
            'Gruntfile.coffee'
            'file_input.coffee'
            'xhr.coffee'
            'yafu.coffee'
            'test/**/*.coffee'
            ]
        options:
          max_line_length:
            level: 'warn'
          no_backticks:
            level: 'warn'
    jshint:
      manifest: ['*.json']
    browserify:
      assets:
        files:
          'yafu.js': ['yafu.coffee']
          'exemple/exemple.js': ['exemple/exemple.coffee']
        options:
          browserifyOptions:
            standalone: 'yafu'
          external: ['jquery', 'lodash']
          transform: ['coffeeify']
      test:
        files:
          'test/xhr_spec.js': ['test/xhr_spec.coffee']
          'test/file_input_spec.js': ['test/file_input_spec.coffee']
        options:
          transform: ['coffeeify']
    mocha:
      options:
        run: true
        log: true
      test:
        src: ['test/test.html']
    watch:
      files: ['*.coffee', 'test/**/*.coffee', 'exemple/**/*.coffee']
      tasks: ['coffeelint', 'coffee','mocha']

  grunt.registerTask 'default', [
    'jshint'
    'coffeelint'
    'browserify'
    'mocha'
    ]
