define('game/graphic', 
       ['underscore', 'game/entity', 'game/sprite', 'game/rectangle', 'game/circle'],
       function(_, Entity, Sprite, Rectangle, Circle) {
  var Graphic = Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Graphic',
        width: 20,
        height: 20,
        frame: 0,
        url: 'assets/images/test.png',
        spriteScale: 4,
        alwaysVisible: true,
        revealDistance: 3,
        visible: true
      });

      Entity.prototype.initialize.call(this, options);

      this.width = options.width;
      this.height = options.height;
      this.frame = options.frame;
      this.alwaysVisible = options.alwaysVisible;
      this.revealDistance = options.revealDistance;
      this.spriteScale = options.spriteScale;
      this.sprite = new Sprite({
        url: options.url, 
        width: this.width * this.spriteScale, 
        height: this.height * this.spriteScale
      });

      this.sprite.goTo(this.frame);
    },
    draw: function(clicked) {
      // Defaults to noop..
    },
    dispose: function() {
      Entity.prototype.dispose.apply(this, arguments);
      this.sprite.dispose();
      this.sprite = null;
    },
    redraw: function() {
      var drawRect = new Rectangle(this.position.x, 
                                   this.position.y,
                                   this.position.x + this.width,
                                   this.position.y + this.height);

      this.trigger('draw', drawRect);
    },
    reveal: function() {
      var position = this.position.clone();
      //position.x = position.x + 1 / 18;
      //position.y = position.y + 1 / 18;
      this.trigger('reveal', this.name, new Circle(this.revealDistance, position));
    }
  });

  return Graphic;
});
