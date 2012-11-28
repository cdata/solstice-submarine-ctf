define('model/game/fork',
       ['underscore', 'backbone'],
       function(_, Backbone) {
  var Fork = Backbone.Model.extend({
    defaults: {
      team: 'sub',
      carried: false,
      unit: null,
      position: null
    },
    canBePickedUp: function() {
      return !this.get('carried');
    }
  });

  return Fork;
});
