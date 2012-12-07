if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'backbone'],
       function(_, Backbone) {
  var Move = Backbone.Model.extend({
    defaults: {
      unit: 'subA',
      points: [],
      start: null,
      shielded: false
    },
    getLastPosition: function() {
      return this.get('points')[this.get('points').length];
    },
    validate: function(attrs) {
      var points = attrs.points;
      var shielded = attrs.shielded;
      var invalid = false;
      var last;

      if (points) {
        _.each(points, function(point) {
          if (!last) {
            point = last;
          } else if (!point.distanceTo(last) === 1) {
            invalid = true;
          }
        });

        if (points.length > 4) {
          invalid = true;
        }

        if (shielded && points.length > 2) {
          invalid = true;
        }
      }

      if (invalid) {
        return 'Invalid move settings.';
      }
    }
  }, {
    unit: {
      SUB_A: 'subA',
      SUB_B: 'subB',
      RKT_A: 'rktA',
      RKT_B: 'rktB'
    }
  });

  return Move;
});
