define('game/entity/fork',
       ['underscore', 'game/graphic', 'game/vector2'],
       function(_, Graphic, Vector2) {
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
      var carried = this.model.get('carried');

      if (position) {
        this.position = position;
        this.rotation = 0;
        this.sprite.goTo(this.color === 'yellow' ? 0 : 1);
      } else if(carried) {
        this.position = new Vector2();
        this.sprite.goTo(this.color === 'yellow' ? 6 : 5);
      } else {
        this.sprite.goTo(2);
      }

      //this.reveal();
      this.redraw();
    }
  });
});
