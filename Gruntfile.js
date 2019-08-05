module.exports = function (grunt) {

  let screeps_config = require('./screeps.json');

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-rollup');
  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      default: {
        tsconfig: './tsconfig.json'
      }
    },
    rollup: {
      options: { format: 'cjs' },
      files: {
        'dest':'dist/push/main.js',
        'src' : 'dist/compile/main.js',
      },
    },
    screeps: {
      options: {
        email: screeps_config.email,
        password: screeps_config.password,
        branch: screeps_config.branch,
        ptr: screeps_config.ptr
      },
      dist: {
        src: ['dist/push/*.js']
      }
    },
  });

  grunt.registerTask("default", ["ts", 'rollup', 'screeps']);

};