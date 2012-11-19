define('game/entity/grass',
       ['underscore', 'game/graphic/animated'],
       function(_, AnimatedGraphic) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Grass',
        url: 'assets/images/floor.png',
        frameInterval: 1000
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('grass', 1, 2);
      this.useFrameAnimation('grass');
    }
  });
});

