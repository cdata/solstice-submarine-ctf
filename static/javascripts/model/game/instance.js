if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'backbone'],
       function(_, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      rktClient: null,
      subClient: null,
      rktScore: 0,
      subScore: 0,
      rktFork: null,
      subFork: null,
      rktNextMove: null,
      subNextMove: null
    },
    submarines: function() {
      return this.get('subClient');
    },
    rockets: function() {
      return this.get('rktClient');
    }
  });
});
