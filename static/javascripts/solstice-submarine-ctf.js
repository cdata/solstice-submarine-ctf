requirejs.config({
  baseUrl: 'javascripts',
  //urlArgs: 'bust=' + (new Date()).getTime(),
  paths: {
    'jquery': 'support/jquery',
    'underscore': 'support/lodash',
    'backbone': 'support/backbone',
    'stats': 'support/stats',
    'tween': 'support/tween',
    'q': 'support/q',
    'handlebars': 'support/handlebars',
    'persona': 'https://login.persona.org/include',
    'io': 'https://socket.solsticesub.com/socket.io/socket.io'
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
    },
    'io': {
      exports: 'io'
    }
  }
});

require(['app'], function(App) {
  // TODO: ?
  window.app = new App();
  
});
