define('game/entity/fork',
       ['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Fork',
        url: 'assets/images/items.png',
        color: 'yellow'
      });
      Graphic.prototype.initialize.call(this, options);

      this.color = options.color;
      this.model = options.model;
      this.model.on('change', this.reset, this);
    },
    dispose: function() {
      Graphic.prototype.dispose.apply(this, arguments);

      this.model.off(null, null, this);
      this.model = null;
    },
    reset: function() {
      var position = this.model.get('position');

      if (position) {
        this.position = position;
        if (this.color == 'yellow') {
          this.sprite.goTo(0);
        } else {
          this.sprite.goTo(1);
        }
      } else {
        this.sprite.goTo(2);
      }

      //this.reveal();
      this.redraw();
    }
  });
});
