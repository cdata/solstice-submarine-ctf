if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'backbone'],
       function(_, Backbone) {
  var Fork = Backbone.Model.extend({
    defaults: {
      team: 'sub',
      carried: false,
      unit: null,
      position: null,
      origin: null
    },
    canBePickedUp: function() {
      return !this.get('carried');
    }
  });

  return Fork;
});
