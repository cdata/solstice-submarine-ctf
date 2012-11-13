define('game/entity',
       ['underscore', 'game/node', 'three'], 
       function(_, Node, THREE) {
  return Node.extend({
    initialize: function(options) {
      Node.prototype.initialize.apply(this, arguments);

      options = _.defaults(options || {}, {
        name: 'Anonymous',
        position: new THREE.Vector2(),
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
      rect.set(rect.getLeft() + this.position.x,
               rect.getTop() + this.position.y,
               rect.getRight() + this.position.x,
               rect.getBottom() + this.position.y);

      Node.prototype.onChildDraw.call(this, rect);
    },
    toString: function() {
      return '[' + this.name + ' Entity, x ' + this.position.x + ', y ' + this.position.y + ', r ' + this.rotation + ']';
    }
  });
});
