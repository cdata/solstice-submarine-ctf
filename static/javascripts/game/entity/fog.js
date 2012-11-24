define('game/entity/fog',
       ['game/graphic'],
       function(Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/fog.png'
      });

      Graphic.prototype.initialize.call(this, options);
    },
    invalidateNeighbors: function() {
      var top = neighbors.top;
      var left = neighbors.left;
      var right = neighbors.right;
      var bottom = neighbors.bottom;

      this.sprite.goTo(0);

      /*if ((top & left & right & bottom) === 512) {
        this.sprite.goTo(0);
      } else if ((top & left & right) === 512) {
        this.sprite.goTo(4);
        this.rotation = Math.PI / 2;
      } else if ((bottom & left & right) === 512) {
        this.sprite.goTo(4);
        this.rotation = -Math.PI / 2;
      } else if ((bottom & left & top) === 512) {
        this.sprite.goTo(4);
      } else if ((bottom & right & top) === 512) {
        this.sprite.goTo(4);
        this.rotation = Math.PI;
      } else if ((bottom & top) === 512) {
        this.sprite.goTo(5);
        this.rotation = Math.PI / 2;
      } else if ((left & right) === 512) {
        this.sprite.goTo(5);
      } else if ((left & top) === 512) {
        this.sprite.goTo(3);
        this.rotation = Math.PI / 2;
      } else if ((left & bottom) === 512) {
        this.sprite.goTo(3);
      } else if ((right & top) === 512) {
        this.sprite.goTo(3);
        this.rotation = Math.PI;
      } else if ((right & bottom) === 512) {
        this.sprite.goTo(3);
        this.rotation = -Math.PI / 2;
      } else if ((right & 512) === 512) {
        this.sprite.goTo(2);
        this.rotation = Math.PI;
      } else if ((left & 512) === 512) {
        this.sprite.goTo(2);
      } else if ((top & 512) === 512) {
        this.sprite.goTo(2);
        this.rotation = Math.PI / 2;
      } else if ((bottom & 512) === 512) {
        this.sprite.goTo(2);
        this.rotation = -Math.PI / 2;
      } else {
        this.sprite.goTo(1);
      }*/

    }
  });
});
