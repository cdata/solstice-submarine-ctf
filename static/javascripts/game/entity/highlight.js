if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/highlight.png',
        name: 'Fog',
        color: 0
      });
      Graphic.prototype.initialize.call(this, options);
      this.color = options.color;
    },
    invalidateNeighbors: function(neighbors) {
      var top = neighbors.top;
      var left = neighbors.left;
      var right = neighbors.right;
      var bottom = neighbors.bottom;
      var frame = 0;

      if ((top & left & right & bottom & 128) === 128) {
        frame = 0;
      } else if ((top & left & right & 128) === 128) {
        frame = 4;
        this.rotation = Math.PI / 2;
      } else if ((bottom & left & right & 128) === 128) {
        frame = 4;
        this.rotation = -Math.PI / 2;
      } else if ((bottom & left & top & 128) === 128) {
        frame = 4;
      } else if ((bottom & right & top & 128) === 128) {
        frame = 4;
        this.rotation = Math.PI;
      } else if ((bottom & top & 128) === 128) {
        frame = 5;
        this.rotation = Math.PI / 2;
      } else if ((left & right & 128) === 128) {
        frame = 5;
      } else if ((left & top & 128) === 128) {
        frame = 3;
        this.rotation = Math.PI / 2;
      } else if ((left & bottom & 128) === 128) {
        frame = 3;
      } else if ((right & top & 128) === 128) {
        frame = 3;
        this.rotation = Math.PI;
      } else if ((right & bottom & 128) === 128) {
        frame = 3;
        this.rotation = -Math.PI / 2;
      } else if ((right & 128) === 128) {
        frame = 2;
        this.rotation = Math.PI;
      } else if ((left & 128) === 128) {
        frame = 2;
      } else if ((top & 128) === 128) {
        frame = 2;
        this.rotation = Math.PI / 2;
      } else if ((bottom & 128) === 128) {
        frame = 2;
        this.rotation = -Math.PI / 2;
      } else {
        frame = 1;
      }

      frame += this.color;

      this.sprite.goTo(frame);
    }
  });
});
