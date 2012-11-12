define('game/map', 
       ['underscore', 'game/entity', 'game/graphic', 'game/assets', 'game/entity/wall', 'game/entity/fork'], 
       function(_, Entity, Graphic, assets, Wall, Fork) {
  return Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Map',
        url: '/assets/data/seabound.json'
      });

      Entity.prototype.initialize.call(this, options);

      var data = assets.getData(options.url);

      this.tiles = data.tiles;
      this.width = data.width;
      this.height = data.height;

      this.floor = this.append(new Entity({
        name: 'Floor'
      }));
      this.walls = this.append(new Entity({
        name: 'Walls'
      }));
      this.items = this.append(new Entity({
        name: 'Items'
      }));

      _.each(this.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var sand = new Graphic({
          name: 'Sand',
          url: '/assets/images/floor.png',
          position: position
        });
        var tile;

        position.multiplyScalar(sand.width);

        this.floor.append(sand);

        switch (type) {
          case 1:
            this.walls.append(new Wall({
              neighbors: this.neighbors(index),
              position: position
            }));
            break;
          case 2:
          case 3:
            this.items.append(new Fork({
              color: type === 2 ? 'yellow' : 'red',
              position: position.clone()
            }))
            break;
        }
      }, this);
    },
    dispose: function() {
      Entity.prototype.dispose.apply(this, arguments);
      this.tiles = null;
    },
    indexToPosition: function(index) {
      var position = new THREE.Vector2();
      position.x = (index % this.width);
      position.y = Math.floor((index - position.x) / this.width);
      return position;
    },
    positionToIndex: function(position) {
      if (position.x < 0 || position.y < 0 || position.x >= this.width || position.y >= this.height) {
        return -1;
      }

      return position.x + position.y * this.width;
    },
    at: function(position) {
      return this.tiles[this.positionToIndex(position)];
    },
    neighbors: function(index) {
      var position = this.indexToPosition(index);
      var result = {};

      position.y = position.y - 1;
      result.top = this.at(position);
      position.y = position.y + 2;
      result.bottom = this.at(position);
      position.y = position.y - 1;
      position.x = position.x - 1;
      result.left = this.at(position);
      position.x = position.x + 2;
      result.right = this.at(position);
      position.x = position.x - 1;

      return result;
    }
  });
});
