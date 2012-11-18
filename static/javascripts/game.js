define('game', 
       ['three', 'game/object', 'game/loader', 'game/renderer', 'game/engine', 'game/brain'],
       function(THREE, GameObject, Loader, Renderer, Engine, Brain) {
  var Game = GameObject.extend({
    initialize: function() {
    },
    dispose: function() {
      this.renderer.dispose();
      this.engine.dispose();
      this.brain.dispose();

      this.renderer = null;
      this.engine = null;
      this.map = null;
    },
    start: function() {
      this.renderer = new Renderer();

      this.brain = new Brain({
        scene: this.renderer.sceneRoot
      });

      this.engine = new Engine();
      this.engine.on('render', this.renderer.render, this.renderer);
      this.engine.start();
    }
  });

  return Game;
});
