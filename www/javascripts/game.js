define('game', 
       ['game/object', 'game/env', 'game/engine', 'game/map', 'game/hero'],
       function(GameObject, Env, Engine, Map, Hero) {
  var Game = GameObject.extend({
    initialize: function() {
      this.env = new Env(800, 400);
      this.map = new Map(
        9,
        9,
        [ 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 0, 1, 0, 1, 0, 1, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 1, 1, 0, 1, 1, 0, 1,
          1, 0, 1, 0, 0, 0, 1, 0, 1,
          1, 0, 1, 1, 0, 1, 1, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 1, 0, 1, 0, 1, 0, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1 ]);
      this.hero = [
        new Hero(),
        new Hero()
      ];

      this.engine = new Engine();
      this.engine.on('render', this.render, this);
      this.engine.start();
    },
    render: function() {
      var context = this.env.context;

      context.fillStyle = '#ddd';
      context.fillRect(0, 0, 800, 600);

      _.each(this.map.tiles, function(tile) {
        //tile.graphic.draw();
        //context.fillStyle = tile.graphic.color;
        //context.fillRect(tile.x * Graphic.SIZE, tile.y * Graphic.SIZE, Graphic.SIZE, Graphic.SIZE);
      }, this);

      _.each(this.hero, function(hero) {
        //hero.graphic.draw();
        //context.fillStyle = hero.graphic.color;
        //context.fillRect(hero.x * Graphic.SIZE, hero.y * Graphic.SIZE, Graphic.SIZE, Graphic.SIZE);
      });
    }
  });

  return Game;
});
