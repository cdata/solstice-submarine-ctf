define('model/game/turn',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      moveAlpha: null,
      moveBeta: null
    }
  });
});
