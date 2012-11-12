define('game/graphic', 
       ['underscore', 'game/entity', 'game/sprite'],
       function(_, Entity, Sprite) {
  var Graphic = Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Graphic',
        width: 20,
        height: 20,
        frame: 0,
        url: '/assets/images/test.png',
        spriteScale: 4
      });

      Entity.prototype.initialize.call(this, options);

      this.width = options.width;
      this.height = options.height;
      this.frame = options.frame;
      this.spriteScale = options.spriteScale;
      this.sprite = new Sprite({
        url: options.url, 
        width: this.width * this.spriteScale, 
        height: this.height * this.spriteScale
      })

      this.sprite.goTo(this.frame);
    },
    dispose: function() {
      Entity.prototype.dispose.apply(this, arguments);
      this.sprite.dispose();
      this.sprite = null;
    }
  });

  return Graphic;
});
