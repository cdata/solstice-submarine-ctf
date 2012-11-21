define('game/entity/waypoint',
       ['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/waypoint.png'
      });
      Graphic.prototype.initialize.call(this, options);
    },
    invalidateNeighbors: function(neighbors) {
      var top = neighbors.top;
      var left = neighbors.left;
      var right = neighbors.right;
      var bottom = neighbors.bottom;

      if ((top & bottom) === 256) {
        this.sprite.goTo(2);
      } else if ((left & right) === 256) {
        this.sprite.goTo(2);
        this.rotation = Math.PI / 2;
      } else if ((bottom & right) === 256) {
        this.sprite.goTo(0);
      } else if ((bottom & left) === 256) {
        this.sprite.goTo(0);
        this.rotation = Math.PI / 2;
      } else if ((left & top) === 256) {
        this.sprite.goTo(0);
        this.rotation = Math.PI;
      } else if ((top & right) === 256) {
        this.sprite.goTo(0);
        this.rotation = -Math.PI / 2;
      } else if (left & 256) {
        this.sprite.goTo(1);
      } else if (bottom & 256) {
        this.sprite.goTo(1);
        this.rotation = Math.PI / 2;
      } else if (right & 256) {
        this.sprite.goTo(1);
        this.rotation = Math.PI;
      } else if (right & 256) {
        this.sprite.goTo(1);
        this.rotation = -Math.PI / 2;
      }
    }
  });
});
