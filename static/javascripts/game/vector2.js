define('game/vector2',
       ['game/object'],
       function(GameObject) {
  var Vector2 = GameObject.extend({
    initialize: function(x, y) {
      this.reset();
      this.set(x, y);
    },
    reset: function() {
      this.x = 0;
      this.y = 0;
    },
    set: function(x, y) {
      this.x = x || this.x;
      this.y = y || this.y;
    },
    dot: function(other) {
      return this.x * other.x + this.y * other.y;
    },
    length: function() {
      return Math.sqrt(this.dot(this));
    },
    divide: function(scalar) {
      this.x /= scalar;
      this.y /= scalar;

      return this;
    },
    multiply: function(scalar) {
      this.x *= scalar;
      this.y *= scalar;

      return this;
    },
    subtract: function(other) {
      this.x -= other.x;
      this.y -= other.y;

      return this;
    },
    add: function(other) {
      this.x += other.x;
      this.y += other.y;

      return this;
    },
    normalize: function() {
      return this.divide(this.length());
    },
    distanceTo: function(other) {
      var dx = this.x - other.x;
      var dy = this.y - other.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    equals: function(other) {
      return this.x === other.x && this.y === other.y;
    },
    clone: function() {
      return new Vector2(this.x, this.y);
    },
    copy: function(other) {
      this.set(other.x, other.y);
      return this;
    }
  });

  return Vector2;
});
