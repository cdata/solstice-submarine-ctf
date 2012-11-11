define('game/graphic', ['game/entity', 'game/sprite'], function(Entity, Sprite) {
  var Graphic = Entity.extend({
    initialize: function(url, frame, width, height) {

      Entity.prototype.initialize.call(this, 'Graphic');
      this.width = width || 20;
      this.height = height || 20;
      this.frame = frame || 0
      this.sprite = new Sprite(url, 80, 80);
      this.sprite.goTo(this.frame);

    }
  });

  return Graphic;
});
