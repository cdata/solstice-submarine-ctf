define('game/entity', ['game/object'], function(GameObject) {
  return GameObject.extend({
    initialize: function(name, sprite, frameInterval) {
      GameObject.prototype.initialize.apply(this, arguments);
      this.name = name || 'plain';
      //this.graphic = new Graphic();
      this.moveTo(-1, -1);
    },
    moveTo: function(x, y) {
      this.x = x;
      this.y = y;
    },
    toString: function() {
      return '[Entity ' + this.name + ', x ' + this.x + ', y ' + this.y + ']';
    }
  });
});
