define('game/entity/nemesis',
       ['underscore', 'game/entity/hero', 'model/game/move'],
       function(_, Hero, Move) {
  return Hero.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/red-rocket.png',
        name: 'Nemesis',
        alwaysVisible: false
      });

      if (options.name === 'rktB') {
        options.url = 'assets/images/blue-rocket.png'
      }

      Hero.prototype.initialize.call(this, options);

      // Boy I'm lazy..
      this.defineFrameAnimation('die', 9, 4);
      this.defineFrameAnimation('respawn', 4, 9);
    },
    checkForPositionChange: function() {
      // Noop.
    }
  });
});
