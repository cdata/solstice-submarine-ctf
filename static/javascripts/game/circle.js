if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/object', 'game/vector2'],
       function(_, GameObject, Vector2) {
  return GameObject.extend({
    initialize: function(radius, position) {
      this.position = position || new Vector2();
      this.radius = radius || 0;
    }
  });
});
