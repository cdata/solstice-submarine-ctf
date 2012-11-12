define('game', 
       ['three', 'game/object', 'game/loader', 'game/env', 'game/engine', 'game/map', 'game/hero', 'game/assets'],
       function(THREE, GameObject, Loader, Env, Engine, Map, Hero, assets) {
  var Game = GameObject.extend({
    initialize: function() {
    },
    dispose: function() {
      this.env.dispose();
      this.engine.dispose();
      this.map.dispose();

      this.env = null;
      this.engine = null;
    },
    start: function() {
      this.env = new Env({
        width: 800,
        height: 400
      });

      this.map = new Map({
        url: '/assets/data/maps/seabound.json'
      });

      this.engine = new Engine();
      this.engine.on('render', this.render, this);
      this.engine.start();
      //this.render();
    },
    render: function() {
      this.env.drawScene(this.map);
    }
  });

  return Game;
});
