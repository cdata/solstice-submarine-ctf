if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

console.log('Loaded Game Object Module..');

define(['backbone'], function(Backbone) {
  console.log('Initializing..');
  function GameObject() {
    this.initialize.apply(this, arguments);
  }

  // Repurpose the Backbone inheritance model..
  GameObject.extend = Backbone.View.extend;

  GameObject.prototype.initialize = function() {};

  GameObject.prototype.dispose = function() {};

  return GameObject;
});
