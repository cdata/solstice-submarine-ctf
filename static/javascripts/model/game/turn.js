define('model/game/turn',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      moveA: null,
      moveB: null
    }
  });
});
