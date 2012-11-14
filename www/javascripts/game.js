define('game', 
       ['three', 'game/object', 'game/loader', 'game/renderer', 'game/engine', 'game/map', 'game/assets'],
       function(THREE, GameObject, Loader, Renderer, Engine, Map, assets) {
  var Game = GameObject.extend({
    initialize: function() {
    },
    dispose: function() {
      this.renderer.dispose();
      this.engine.dispose();
      this.map.dispose();

      this.renderer = null;
      this.engine = null;
      this.map = null;
    },
    start: function() {
      this.renderer = new Renderer();
      this.renderer.on('click:Hero click:Fork', this.handleEntityClick, this);

      this.map = this.renderer.sceneRoot.append(new Map({
        url: '/assets/data/maps/seabound.json'
      }));

      this.engine = new Engine();
      this.engine.on('render', this.renderer.render, this.renderer);
      this.engine.start();
    },
    handleEntityClick: function() {
      console.log('Click!', arguments);
    }
  });

  return Game;
});
