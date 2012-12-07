if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Wall',
        url: 'assets/images/walls.png',
        neighbors: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }
      });

      Graphic.prototype.initialize.call(this, options);

      this.neighbors = options.neighbors;
      this.invalidateNeighbors();
    },
    dispose: function() {
      Graphic.prototype.dispose.apply(this, arguments);

      this.neighbors = null;
    },
    invalidateNeighbors: function() {
      var top = this.neighbors.top;
      var left = this.neighbors.left;
      var right = this.neighbors.right;
      var bottom = this.neighbors.bottom;

      if (top | left |
            bottom | right === 0) {
        this.sprite.goTo(0);
      }

      if ((top & left & right & bottom & 1) === 1) {
        this.sprite.goTo(13);
      } else if ((top & left & right & 1) === 1) {
        this.sprite.goTo(12);
      } else if ((bottom & left & right & 1) === 1) {
        this.sprite.goTo(11);
      } else if ((bottom & left & top & 1) === 1) {
        this.sprite.goTo(16);
      } else if ((bottom & right & top & 1) === 1) {
        this.sprite.goTo(15);
      } else if ((bottom & top & 1) === 1) {
        this.sprite.goTo(10);
      } else if ((left & right & 1) === 1) {
        this.sprite.goTo(6);
      } else if ((left & top & 1) === 1) {
        this.sprite.goTo(9);
      } else if ((left & bottom & 1) === 1) {
        this.sprite.goTo(7);
      } else if ((right & top & 1) === 1) {
        this.sprite.goTo(8);
      } else if ((right & bottom & 1) === 1) {
        this.sprite.goTo(5);
      } else if ((right & 1) === 1) {
        this.sprite.goTo(1);
      } else if ((left & 1) === 1) {
        this.sprite.goTo(2);
      } else if ((top & 1) === 1) {
        this.sprite.goTo(3);
      } else if ((bottom & 1) === 1) {
        this.sprite.goTo(4);
      } else {
        this.sprite.goTo(0);
      }
    }
  });
});
