'use strict';

module.exports = function (grunt) {
  function mountFolder(connect, dir) {
    return connect.static(require('path').resolve(dir));
  }

  require('matchdep')
      .filterDev('grunt-*')
      .forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    coffee: {
      test: {
        expand: true,
        flatten: true,
        src: ['spec/*.coffee'],
        dest: 'test/spec/',
        ext: '.js'
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        middleware: function (connect) {
          return [
            'components',
            'src',
            'test'
          ].map(function (dir) { return mountFolder(connect, dir); });
        }
      },
      test: { }
    },

    jshint: {
      options: { jshintrc: '.jshintrc' },
      all: ['dq.js']
    },

    mocha: {
      pure: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/pure_runner.html']
        }
      },
      amd: {
        options: {
          run: false,
          urls: ['http://localhost:<%= connect.options.port %>/amd_runner.html']
        }
      }
    }
  });

  // $ grunt test
  grunt.registerTask('test', [
    'jshint',
    'connect:test',
    'coffee',
    'mocha'
  ]);

  // $ grunt
  grunt.registerTask('default', [
    'test'
  ]);
};
