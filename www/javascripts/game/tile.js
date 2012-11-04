define('game/tile', ['game/entity'], function(Entity) {
  var Tile = Entity.extend({
    initialize: function(type, x, y) {
      Entity.prototype.initialize.apply(this, arguments);

      this.type = type;
      //this.graphic = new Graphic();

      if (this.type === Tile.Type.WALL) {
        //this.graphic.initialize('#555');
      } else {
        //this.graphic.initialize('transparent');
      }
    }
  }, {
    Type: {
      EMPTY: 0,
      WALL: 1,
      HERO: 2,
      ENEMY: 4
    }
  });

  return Tile;
});
