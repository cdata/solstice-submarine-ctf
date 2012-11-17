define('game/entity/hero',
       ['underscore', 'game/graphic/animated', 'tween'],
       function(_, AnimatedGraphic, TWEEN) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Hero',
        url: '/assets/images/yellow-sub.png',
        frameInterval: 700
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('idle-blur', 0, 1);
      this.defineFrameAnimation('idle-focus', 2, 3);

      this.blur();
    },
    blur: function() {
      this.useFrameAnimation('idle-blur');
    },
    focus: function() {
      this.useFrameAnimation('idle-focus');
    },
    move: function(destination) {
      this.tween = new TWEEN.Tween(this.position)
      .to({ x: destination.x, y: destination.y }, 500)
      .onUpdate(_.bind(this.redraw, this))
      .start();
    }
  });
});
