define('game/entity/laser',
       ['underscore', 'game/graphic/animated', 'game/vector2', 'game/sprite'],
       function(_, AnimatedGraphic, Vector2, Sprite) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/laser.png',
        segment: 1,
        direction: new Vector2(1, 0),
        frameInterval: 75
      });
      AnimatedGraphic.prototype.initialize.call(this, options);
      this.segment = options.segment;
      this.setDirection(options.direction);
      this.sprite.goTo = _.bind(this.goTo, this);
      this.defineFrameAnimation('pulse', 0, 1);
      this.useFrameAnimation('pulse');
    },
    dispose: function() {
      this.redraw();
      AnimatedGraphic.prototype.dispose.apply(this, arguments);
    },
    goTo: function(index) {
      Sprite.prototype.goTo.call(this.sprite, this.segment + 5 * index);
    },
    setDirection: function(direction) {
      if (direction.x === 1) {
        this.rotation = 0;
      } else if (direction.x === -1) {
        this.rotation = Math.PI;
      } else if (direction.y === 1) {
        this.rotation = -Math.PI / 2;
      } else if (direction.y === -1) {
        this.rotation = Math.PI / 2;
      }
    }
  });
});
