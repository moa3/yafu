module.exports = (grunt)->

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-mocha'
  grunt.loadNpmTasks 'grunt-bower-task'

  grunt.initConfig
    coffeelint:
      app:
        files:
          src: [
            'Gruntfile.coffee'
            'file_input.coffee'
            'xhr.coffee'
            'test/**/*.coffee'
            ]
        options:
          max_line_length:
            level: 'warn'
          no_backticks:
            level: 'warn'
    jshint:
      manifest: ['*.json']
    coffee:
      assets:
        files:
          'file_input.js': ['file_input.coffee']
          'xhr.js': ['xhr.coffee']
      test:
        files:
          'test/xhr_spec.js': ['test/xhr_spec.coffee']
          'test/file_input_spec.js': ['test/file_input_spec.coffee']
    mocha:
      options:
        run: true
        log: true
      test:
        src: ['test/test.html']
    watch:
      files: ['*.coffee', 'test/**/*.coffee']
      tasks: ['coffeelint', 'coffee','mocha']
    bower:
      install:
        targetDir: 'bower_components'
        copy: no

  grunt.registerTask 'default', [
    'bower'
    'jshint'
    'coffeelint'
    'coffee'
    'mocha'
    ]
