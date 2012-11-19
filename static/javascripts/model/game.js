define('model/game',
       ['backbone'],
       function(Backbone) {
  return Backbone.extend({
    defaults: {
      heroScore: 0,
      nemesisScore: 0
    }
  });
});
