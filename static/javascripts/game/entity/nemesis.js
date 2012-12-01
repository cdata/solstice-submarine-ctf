define('game/entity/nemesis',
       ['underscore', 'game/entity/hero', 'model/game/move'],
       function(_, Hero, Move) {
  return Hero.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/red-rocket.png',
        name: 'Nemesis',
        alwaysVisible: false,
        revealDistance: 2
      });

      if (options.name === 'rktB') {
        options.url = 'assets/images/blue-rocket.png'
      }

      Hero.prototype.initialize.call(this, options);

      // Boy I'm lazy..
      this.defineFrameAnimation('die', 9, 4);
      this.defineFrameAnimation('respawn', 4, 9);
    },
    draw: function() {
      var iter = this.firstChild;
      if (iter) {
        // Lazy fix for fork rotation..
        do {
          if (iter.name !== 'Shield') {
            iter.visible = this.visible;
          }
        } while (iter = iter.nextSibling);
      }
      Hero.prototype.draw.apply(this, arguments);
    },
    checkForPositionChange: function() {
      // Noop.
    }
  });
});
