define('collection/game/outcome',
       ['backbone', 'model/game/outcome'],
       function(Backbone, OutcomeModel) {
  return Backbone.Collection.extend({
    model: OutcomeModel
  });
});
