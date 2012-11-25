module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-handlebars');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.initConfig({
    watch: {
      templates: {
        files: 'static/assets/templates/*.handlebars',
        tasks: 'handlebars'
      },
      javascripts: {
        files: 'static/javascripts/**/*.js',
        tasks: 'requirejs'
      }
    },
    handlebars: {
      all: {
        src: 'static/assets/templates',
        dest: 'static/javascripts/support/handlebars/templates.js'
      }
    },
    requirejs: {
      baseUrl: './static/javascripts',
      name: 'solstice-submarine-ctf',
      mainConfigFile: './static/javascripts/solstice-submarine-ctf.js',
      out: './static/javascripts/solstice-submarine-ctf-release.js'
    }
  });
};
