define('game/entity/hero',
       ['underscore', 'game/graphic/animated'],
       function(_, AnimatedGraphic) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Hero',
        url: '/assets/images/yellow-sub.png',
        frameInterval: 700
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('idle', 0, 1);
      this.useFrameAnimation('idle');
      //this.rotation = Math.PI / 2;
    }
  });
});
