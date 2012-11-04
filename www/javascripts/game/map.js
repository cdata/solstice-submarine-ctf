define('game/map', ['game/object', 'game/tile'], function(GameObject, Tile) {
  return GameObject.extend({
    initialize: function(width, height, tiles) {
      GameObject.prototype.initialize.apply(this, arguments);

      this.width = width;
      this.height = height;
      this.tiles = _.map(tiles, function(type, index) {
        var tile = new Tile(type);
        var x = index % this.width;
        var y = Math.floor((index - x) / width);
        tile.moveTo(x, y);
        return tile;
      }, this);
    }
  });
});
