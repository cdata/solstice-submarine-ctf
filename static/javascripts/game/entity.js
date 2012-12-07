if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/node', 'game/vector2'], 
       function(_, Node, Vector2) {
  return Node.extend({
    initialize: function(options) {
      Node.prototype.initialize.apply(this, arguments);

      options = _.defaults(options || {}, {
        name: 'Anonymous',
        position: new Vector2(),
        rotation: 0
      });

      this.name = options.name;
      this.position = options.position;
      this.rotation = options.rotation;
    },
    dispose: function() {
      Node.prototype.dispose.apply(this, arguments);
      this.position = null;
    },
    onChildDraw: function(rect) {
      rect.set(rect.left + this.position.x,
               rect.top + this.position.y,
               rect.right + this.position.x,
               rect.bottom + this.position.y);

      Node.prototype.onChildDraw.call(this, rect);
    },
    onChildReveal: function(name, circle) {
      circle.position.add(this.position);
      Node.prototype.onChildReveal.call(this, name, circle);
    },
    toString: function() {
      return '[' + this.name + ' Entity, x ' + this.position.x + ', y ' + this.position.y + ', r ' + this.rotation + ']';
    }
  });
});
