define('model/game',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      connected: false,
      subScore: 0,
      rktScore: 0,
      turn: null,
      forks: null
    }
  });
});
