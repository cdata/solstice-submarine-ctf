define('game/rectangle',
       ['game/object'],
       function(GameObject) {
  return GameObject.extend({
    initialize: function(left, top, right, bottom) {
      this.reset();
      this.set(left, top, right, bottom);
    },
    reset: function() {
      this.left = 0;
      this.top = 0;
      this.right = 0;
      this.bottom = 0;
    },
    set: function(left, top, right, bottom) {
      this.left = typeof left !== 'undefined' ? left : this.left;
      this.top = typeof top !== 'undefined' ? top : this.top;
      this.right = typeof right !== 'undefined' ? right : this.right;
      this.bottom = typeof bottom !== 'undefined' ? bottom : this.bottom;

      if (this.left === this.right && this.left !== 0)
        debugger;
    },
    getX: function() {
      return this.left;
    },
    getY: function() {
      return this.top;
    },
    getWidth: function() {
      return this.right - this.left;
    },
    getHeight: function() {
      return this.bottom - this.top;
    },
    intersects: function(other) {
      if (this.right < other.left) {
        return false;
      }
      if (this.left > other.right) {
        return false;
      }
      if (this.bottom < other.top) {
        return false;
      }
      if (this.top > other.bottom) {
        return false;
      }
      return true;
    },
    add: function(other) {
      this.left = this.left < other.left ? this.left : other.left;
      this.top = this.top < other.top ? this.top : other.top;
      this.right = this.right > other.right ? this.right : other.right;
      this.bottom = this.bottom > other.bottom ? this.bottom : other.bottom;
    }
  });
});
