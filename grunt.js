module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-handlebars');
  grunt.initConfig({
    watch: {
      files: 'www/assets/templates/*.handlebars',
      tasks: 'handlebars'
    },
    handlebars: {
      all: {
        src: 'www/assets/templates',
        dest: 'www/javascripts/support/handlebars/templates.js'
      }
    }
  });
};
