define('game/entity/highlight',
       ['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/highlight.png'
      });
      Graphic.prototype.initialize.call(this, options);
    },
    invalidateNeighbors: function(neighbors) {
      var top = neighbors.top;
      var left = neighbors.left;
      var right = neighbors.right;
      var bottom = neighbors.bottom;

      if ((top & left & right & bottom) === 128) {
        this.sprite.goTo(0);
      } else if ((top & left & right) === 128) {
        this.sprite.goTo(4);
        this.rotation = Math.PI / 2;
      } else if ((bottom & left & right) === 128) {
        this.sprite.goTo(4);
        this.rotation = -Math.PI / 2;
      } else if ((bottom & left & top) === 128) {
        this.sprite.goTo(4);
      } else if ((bottom & right & top) === 128) {
        this.sprite.goTo(4);
        this.rotation = Math.PI;
      } else if ((bottom & top) === 128) {
        this.sprite.goTo(5);
        this.rotation = Math.PI / 2;
      } else if ((left & right) === 128) {
        this.sprite.goTo(5);
      } else if ((left & top) === 128) {
        this.sprite.goTo(3);
        this.rotation = Math.PI / 2;
      } else if ((left & bottom) === 128) {
        this.sprite.goTo(3);
      } else if ((right & top) === 128) {
        this.sprite.goTo(3);
        this.rotation = Math.PI;
      } else if ((right & bottom) === 128) {
        this.sprite.goTo(3);
        this.rotation = -Math.PI / 2;
      } else if ((right & 128) === 128) {
        this.sprite.goTo(2);
        this.rotation = Math.PI;
      } else if ((left & 128) === 128) {
        this.sprite.goTo(2);
      } else if ((top & 128) === 128) {
        this.sprite.goTo(2);
        this.rotation = Math.PI / 2;
      } else if ((bottom & 128) === 128) {
        this.sprite.goTo(2);
        this.rotation = -Math.PI / 2;
      } else {
        this.sprite.goTo(1);
      }
    }
  });
});
