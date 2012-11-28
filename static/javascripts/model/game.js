define('model/game',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      connected: false,
      yourScore: 0,
      opponentScore: 0,
      turn: null,
      forks: null
    }
  });
});
