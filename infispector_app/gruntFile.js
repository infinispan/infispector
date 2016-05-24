  module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-shell'); // npm install grunt-nodemon --save-dev
  grunt.loadNpmTasks('grunt-concurrent'); // npm install --save-dev grunt-concurrent

  grunt.registerTask('default', ['jshint','build','concurrent:target' /*.,'karma:unit'*/]);
  grunt.registerTask('build', ['clean','concat:dev','copy','processhtml:dev']);
  grunt.registerTask('release', ['jshint','clean','concat:dist','uglify',/*'karma:unit',*/'copy:assets','processhtml:dist']);
  grunt.registerTask('test-watch', [/*'karma:watch'*/]);
  grunt.registerTask('js', ['jshint','clean','concat:dev','copy' /* ,'karma:unit' */]);
  grunt.registerTask('tpl-watch', ['clean','copy:tpl','watch:tpl' /* ,'karma:unit' */]);
  grunt.registerTask('app-watch', ['jshint','clean','concat:dev','copy','watch:js' /* ,'karma:unit' */]);

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

  var karmaConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Chrome'], reporters: 'dots' };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  grunt.initConfig({
    distdir: 'app',
    pkg: grunt.file.readJSON('package.json'),
    banner:
    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
    ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
  
    src: {
      app: ['src/js/*.js'],
      chordDiagram: ['src/js/graphs/chordDiagram.js'],
      messageFlowChart: ['src/js/graphs/messageFlowChart.js'],
      messageFlowChartCaller: ['src/js/graphs/messageFlowChartCaller.js'],
      components: ['src/js/components/*.js'],
      controllers: ['src/js/controllers/*.js'],
      directives: ['src/js/directives/*.js'],
      services: ['src/js/services/*.js'],
      lib: ['src/lib/'],
      img: ['src/img/*.jpg', 'src/img/*.png', 'src/img/*.svg'],
      specs: ['test/**/*.spec.js'],
      scenarios: ['test/**/*.scenario.js'],
      html: ['src/views/index.html'],
      tpl: {
        app: ['src/views/partials/*.tpl.html']
      }
    },
    processhtml: {
      options: {
        // Task-specific options go here.
      },
      dev: {
        options: {
          process: true
        },
        files: {
          '<%= distdir %>/views/index.html': ['<%= src.html %>']
        }
      },
      dist: {
        options: {
          process: true
        },
        files: {
          '<%= distdir %>/views/index.html': ['<%= src.html %>']
        }
      }
    },
    clean: {
      options: {
        src: ['<%= distdir %>/*'],
        force: 'true'
      }
    },
    copy: {
      assets: {
        files: [{ cwd: 'src/assets', src : '**', dest: '<%= distdir %>/assets', expand: true }]
      },
      tpl: {
        files: [{ cwd: 'src/views', src: ['*.tpl.html','**/*.tpl.html','**/**/*.tpl.html','*.html','**/*.html','**/**/*.html'],
            dest: '<%= distdir %>/views/', expand: true, filter: 'isFile'}]
      },
      css: {
        files: [{ cwd: 'src/css', src: ['*.css'], dest: '<%= distdir %>/css/', expand: true,  flatten: true, filter: 'isFile'}]
      },
      img: {
          files: [{ cwd: 'src/img', src: ['*.svg', '*.jpg', '*.png'], dest: '<%= distdir %>/img/', expand: true,  flatten: true, filter: 'isFile'}]
      }
    },
    // karma: {
    //   unit: { options: karmaConfig('test/config/unit.js') },
    //   watch: { options: karmaConfig('test/config/unit.js', { singleRun:false, autoWatch: true}) }
    // },
    concat:{
      dev:{
        options: {
          banner: "<%= banner %>"
        },
        files: {
          '<%= distdir %>/js/app.js':['<%= src.app %>'],
          '<%= distdir %>/js/chordDiagram.js':['<%= src.chordDiagram %>'],
          '<%= distdir %>/js/messageFlowChart.js':['<%= src.messageFlowChart %>'],
          '<%= distdir %>/js/messageFlowChartCaller.js':['<%= src.messageFlowChartCaller %>'],
          '<%= distdir %>/js/components.js':['<%= src.components %>'],
          '<%= distdir %>/js/controllers.js':['<%= src.controllers %>'],
          '<%= distdir %>/js/directives.js':['<%= src.directives %>'],
          '<%= distdir %>/js/services.js':['<%= src.services %>'],
          '<%= distdir %>/js/angular.js':['<%= src.lib %>angular/*.js'],
          '<%= distdir %>/js/jquery.js':['<%= src.lib %>jquery/*.js'],
          '<%= distdir %>/js/plugins.js':['<%= src.lib %>plugins/*.js'],
          '<%= distdir %>/js/ngmodules.js':['<%= src.lib %>ngModules/*.js']
        }
      },
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        files: {
          '<%= distdir %>/js/app.js':['<%= src.app %>','<%= src.components %>','<%= src.controllers %>','<%= src.services %>'],
          '<%= distdir %>/js/chordDiagram.js':['<%= src.chordDiagram %>'],
          '<%= distdir %>/js/messageFlowChart.js':['<%= src.messageFlowChart %>'],
          '<%= distdir %>/js/messageFlowChartCaller.js':['<%= src.messageFlowChartCaller %>'],
          '<%= distdir %>/js/plugins.js':['<%= src.lib %>plugins/*.js'],
          '<%= distdir %>/js/ngmodules.js':['<%= src.lib %>ngModules/*.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= distdir %>/js/app.min.js': '<%= distdir %>/js/app.js',
          '<%= distdir %>/js/chordDiagram.min.js': '<%= distdir %>/js/graph/chordDiagram.js',
          '<%= distdir %>/js/messageFlowChart.min.js': '<%= distdir %>/js/graph/messageFlowChart.js',
          '<%= distdir %>/js/messageFlowChartCaller.min.js': '<%= distdir %>/js/graph/messageFlowChartCaller.js',
          '<%= distdir %>/js/plugins.min.js': '<%= distdir %>/js/plugins.js',
          '<%= distdir %>/js/ngmodules.min.js':['<%= distdir %>/js/ngmodules.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/js/**/*.js', 'src/js/*.js', 'test/**/*.js'],
      options: {
        asi: true,
        sub: true,
        expr: true,
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          app: true,
          angular: true,
          document: true
        }
      }
    },
      
      
    watch: {
      js:{
        files: ['<%= jshint.files %>'],
        tasks: ['jshint','concat:dev']
      },
      tpl: {
        files: ['src/*.tpl.html','src/**/*.tpl.html','src/*.html','src/**/*.html'],
        tasks: ['copy:tpl']
      },
      assets: {
        files: ['src/assets/*.json'],
        tasks: ['copy:assets']
      }
    },

      serverFile: 'app.js',
      shell: {
          nodemon: {
              command: 'nodemon <%= serverFile %>',
              options: {
                  stdout: true,
                  stderr: true
              }
          }
      },

      concurrent: {
          target: {
              tasks: ['watch:tpl', 'watch:js', 'watch:assets', 'shell:nodemon'],
              options: {
                  logConcurrentOutput: true
              }
          }
      }
  });

      
};