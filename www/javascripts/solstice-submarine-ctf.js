requirejs.config({
  baseUrl: '/javascripts',
  paths: {
    'jquery': '/javascripts/support/jquery',
    'underscore': '/javascripts/support/lodash',
    'backbone': '/javascripts/support/backbone',
    'three': '/javascripts/support/three',
    'stats': '/javascripts/support/stats',
    'tween': '/javascripts/support/tween'
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
    }
  }
});

require(['game'], function(Game) {
  // TODO: ?
  window.game = new Game();
});
