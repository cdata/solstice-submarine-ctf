define('game/object', ['backbone'], function(Backbone) {
  function GameObject() {
    this.initialize.apply(this, arguments);
  }

  // Repurpose the Backbone inheritance model..
  GameObject.extend = Backbone.View.extend;

  GameObject.prototype.initialize = function() {};

  GameObject.prototype.dispose = function() {};

  return GameObject;
});
