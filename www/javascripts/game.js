define('game', 
       ['game/object', 'game/loader', 'game/env', 'game/engine', 'game/map', 'game/hero'],
       function(GameObject, Loader, Env, Engine, Map, Hero) {
  var Game = GameObject.extend({
    initialize: function(assets) {
      this.assets = assets || new Assets();
    },
    dispose: function() {
      this.env.dispose();
      this.engine.dispose();

      this.env = null;
      this.engine = null;
    },
    start: function() {
      this.env = new Env(800, 400);

      this.engine = new Engine();
      this.engine.on('render', this.render, this);
      this.engine.start();
    },
    render: function() {

    }
  });

  return Game;
});
