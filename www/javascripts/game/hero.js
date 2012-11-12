define('game/hero', ['game/entity'], function(Entity) {
  return Entity.extend({
    initialize: function() {
      Entity.prototype.initialize.call(this, {});
    }
  });
});
