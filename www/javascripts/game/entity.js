define('game/entity',
       ['game/node', 'three'], 
       function(Node, THREE) {
  return Node.extend({
    frameInterval: 8,
    initialize: function(name) {
      Node.prototype.initialize.apply(this, arguments);

      this.name = name || 'Anonymous';

      this.position = new THREE.Vector2();
      this.rotation = 0;
    },
    toString: function() {
      return '[' + this.name + ' Entity, x ' + this.position.x + ', y ' + this.position.y + ', r ' + this.rotation + ']';
    }
  });
});
