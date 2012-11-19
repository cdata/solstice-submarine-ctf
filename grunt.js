module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-handlebars');
  grunt.initConfig({
    watch: {
      files: 'static/assets/templates/*.handlebars',
      tasks: 'handlebars'
    },
    handlebars: {
      all: {
        src: 'static/assets/templates',
        dest: 'static/javascripts/support/handlebars/templates.js'
      }
    }
  });
};
