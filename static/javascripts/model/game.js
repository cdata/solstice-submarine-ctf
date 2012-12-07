define(['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      connected: false,
      team: null,
      subScore: 0,
      rktScore: 0,
      turn: null,
      forks: null
    }
  });
});
