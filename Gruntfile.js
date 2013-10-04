/*!
 * Ukko Gruntfile
 * http://github.com/3bola/ukko
 * @author Juri Saltbacka
 */

'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

/**
 * Grunt module
 */
module.exports = function (grunt) {

  /**
   * Dynamically load npm tasks
   */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * Ukko Grunt config
   */
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /**
     * Set project info
     */
    project: {
      
      // Folders
      app:    'app',
      css:    'css',
      dep:    'deploy/<%= pkg.version %>',
      lib:    'lib',
      pub:    'public',
      tmp:    '.tmp',

      // Files
      files: {
        css: [
          '<%= project.css %>/styles.less'
        ],
        js: [
          '<%= project.app %>/*.js'
        ]
      }
    },

    /**
     * Project banner
     * Dynamically appended to CSS/JS files
     * Inherits text from package.json
     */
    tag: {
      banner: '/*!\n' +
              ' * <%= pkg.name %>\n' +
              ' * <%= pkg.title %>\n' +
              ' * <%= pkg.url %>\n' +
              ' * @author <%= pkg.author %>\n' +
              ' * @version <%= pkg.version %>\n' +
              ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
              ' */\n'
    },

    /**
     * Connect port/livereload
     * https://github.com/gruntjs/grunt-contrib-connect
     * Starts a local webserver and injects
     * livereload snippet
     */
    connect: {
      options: {
        port: 8010,
        hostname: '*'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [lrSnippet, mountFolder(connect, 'public')];
          }
        }
      }
    },

    /**
     * Clean files and folders
     * https://github.com/gruntjs/grunt-contrib-clean
     * Remove generated files for clean deploy
     */
    clean: {
      dist: [
        
      ]
    },

    /**
     * JSHint
     * https://github.com/gruntjs/grunt-contrib-jshint
     * Manage the options inside .jshintrc file
     */
    jshint: {
      files: '<%= project.files.js %>',
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /**
     * Concatenate JavaScript files
     * https://github.com/gruntjs/grunt-contrib-concat
     * Imports all .js files and appends project banner
     */
    concat: {
      dev: {
        files: {
          '<%= project.pub %>/assets/js/scripts.js': '<%= project.files.js %>'
        }
      },
      dist: {
        files: {
          '<%= project.dep %>/assets/js/scripts.js': '<%= project.files.js %>'
        }
      },
      options: {
        stripBanners: true,
        nonull: true,
        banner: '<%= tag.banner %>'
      }
    },

    /**
     * Uglify (minify) JavaScript files
     * https://github.com/gruntjs/grunt-contrib-uglify
     * Compresses and minifies all JavaScript files into one
     */
    uglify: {
      options: {
        banner: '<%= tag.banner %>'
      },
      dist: {
        files: {
          '<%= project.dep %>/assets/js/scripts.js': '<%= project.files.js %>'
        }
      }
    },

    /**
     * Compile LESS files
     * https://github.com/gruntjs/grunt-contrib-less
     * Compiles all LESS files and appends project banner
     */
    less: {
      dev: {
        options: {
          paths: '<%= project.css %>'
        },
        files: {
          '<%= project.pub %>/assets/css/styles.css': '<%= project.files.css %>'
        }
      },
      dist: {
        options: {
          paths:       '<%= project.css %>',
          yuicompress: true,
        },
        files: {
          '<%= project.dep %>/assets/css/styles.css': '<%= project.files.css %>'
        }
      }
    },

    /**
     * CSSMin
     * CSS minification
     * https://github.com/gruntjs/grunt-contrib-cssmin
     */
    cssmin: {
      dev: {
        options: {
          banner: '<%= tag.banner %>'
        },
        files: {
          '<%= project.pub %>/assets/css/styles.min.css': [
            '<%= project.pub %>/assets/css/styles.css'
          ]
        }
      },
      dist: {
        options: {
          banner: '<%= tag.banner %>'
        },
        files: {
          '<%= project.dep %>/assets/css/styles.min.css': [
            '<%= project.dep %>/assets/css/styles.css'
          ]
        }
      }
    },

    /**
     * Build bower components
     * https://github.com/yatskevich/grunt-bower-task
     */
    bower: {
      dev: {
        dest: '<%= project.pub %>/assets/components/'
      },
      dist: {
        dest: '<%= project.dep %>/assets/components/'
      }
    },

    /**
     * Minify images
     * https://github.com/gruntjs/grunt-contrib-imagemin
     */
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: '<%= project.pub %>',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= project.dep %>/'
        }]
      }
    },

    /**
     * HTML minify
     * https://github.com/gruntjs/grunt-contrib-htmlmin
     */
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          '<%= project.dep %>/index.html': '<%= project.pub %>/index.html'
        }
      }
    },

    /**
     * Opens the web server in the browser
     * https://github.com/jsoverson/grunt-open
     */
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },

    /**
     * Runs tasks against changed watched files
     * https://github.com/gruntjs/grunt-contrib-watch
     * Watching development files and run concat/compile tasks
     * Livereload the browser once complete
     */
    watch: {
      concat: {
        files: '<%= project.app %>/{,*/}*.js',
        tasks: ['concat:dev', 'jshint']
      },
      sass: {
        files: '<%= project.src %>/scss/{,*/}*.{scss,sass}',
        tasks: ['sass:dev', 'cssmin:dev']
      },
      less: {
        files: '<%= project.css %>/{,*/}*.less',
        tasks: ['less:dev', 'cssmin:dev']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= project.pub %>/{,*/}*.html',
          '<%= project.pub %>/assets/css/*.css',
          '<%= project.pub %>/assets/js/{,*/}*.js',
          '<%= project.pub %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }
  });

  /**
   * Default task
   * Run `grunt` on the command line
   */
  grunt.registerTask('default', [
    'less:dev',
    'cssmin:dev',
    'bower:dev',
    'jshint',
    'concat:dev',
    'connect:livereload',
    'open',
    'watch'
  ]);

  /**
   * Build task
   * Run `grunt build` on the command line
   * Then compress all JS/CSS files
   */
  grunt.registerTask('build', [
    'less:dist',
    'cssmin:dist',
    'bower:dist',
    'concat:dist',
    'imagemin:dynamic',
    'htmlmin:dist',
    'clean:dist',
    'jshint',
    'uglify'
  ]);

};
