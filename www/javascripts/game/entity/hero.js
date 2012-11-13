define('game/entity/hero',
       ['underscore', 'game/graphic'],
       function(_, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: '/assets/images/yellow-sub.png'
      });

      Graphic.prototype.initialize.call(this, options);
      //this.rotation = Math.PI / 2;
    }
  });
});
