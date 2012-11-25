define('collection/game/outcome',
       ['backbone', 'model/game/outcome'],
       function(Backbone, Outcome) {
  return Backbone.Collection.extend({
    model: Outcome,
    getLastOutcome: function() {
      try {
        return this.at(this.length - 1);
      } catch(e) {}
    },
    getLastRecordedPosition: function() {
      var index = this.length - 1;
      var position;
      var points;
      var model;

      while (!position && index > -1) {
        model = this.at(index);
        points = model.get('points');
        position = points[points.length - 1];
      }

      return position;
    }
  });
});
