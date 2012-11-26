define('game/entity/nemesis',
       ['underscore', 'game/entity/hero'],
       function(_, Hero) {
  return Hero.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/red-rocket.png',
        name: 'Nemesis',
        alwaysVisible: false
      });

      Hero.prototype.initialize.call(this, options);
    },
    checkForPositionChange: function() {
      // Noop.
    }
  });
});
