define('game/entity/fork',
       ['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Fork',
        url: '/assets/images/items.png',
        color: 'yellow'
      });
      Graphic.prototype.initialize.call(this, options);

      this.color = options.color;

      if (this.color == 'yellow') {
        this.sprite.goTo(0);
      } else {
        this.sprite.goTo(1);
      }
    }
  });
});
