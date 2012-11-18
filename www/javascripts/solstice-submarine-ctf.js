requirejs.config({
  baseUrl: '/javascripts',
  //urlArgs: 'bust=' + (new Date()).getTime(),
  paths: {
    'jquery': '/javascripts/support/jquery',
    'underscore': '/javascripts/support/lodash',
    'backbone': '/javascripts/support/backbone',
    'three': '/javascripts/support/three',
    'stats': '/javascripts/support/stats',
    'tween': '/javascripts/support/tween',
    'q': '/javascripts/support/q',
    'handlebars': '/javascripts/support/handlebars',
    'persona': 'https://login.persona.org/include'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'underscore': {
      exports: '_'
    },
    'stats': {
      exports: 'Stats'
    },
    'three': {
      exports: 'THREE'
    },
    'tween': {
      exports: 'TWEEN'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
    'handlebars/templates': {
      deps: ['handlebars'],
      exportsFn: function() {
        return Handlebars.templates;
      }
    }
  }
});

require(['app'], function(App) {
  // TODO: ?
  window.app = new App();
  
});
