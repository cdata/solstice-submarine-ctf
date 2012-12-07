if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      moveA: null,
      moveB: null,
      team: null
    },
    toJSON: function() {
      return {
        moveA: this.get('moveA') ? this.get('moveA').toJSON() : null,
        moveB: this.get('moveB') ? this.get('moveB').toJSON() : null
      }
    }
  });
});
