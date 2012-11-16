define('game/world', 
       ['underscore', 'game/entity', 'game/graphic', 'game/assets', 'game/entity/wall', 'game/entity/fork', 'game/entity/hero', 'game/entity/nemesis', 'game/entity/grass'], 
       function(_, Entity, Graphic, assets, Wall, Fork, Hero, Nemesis, Grass) {
  var World = Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'World',
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
      this.highlights = this.append(new Entity({
        name: 'Highlights'
      }));
      this.characters = this.append(new Entity({
        name: 'Characters'
      }));

      _.each(this.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var tile;

        if (type !== 1) {
          tile = this.floor.append(new Graphic({
            name: 'Sand',
            url: '/assets/images/floor.png',
            position: position
          }));
        }

        switch (type) {
          case 0:
            if (Math.random() > 0.8) {
              tile.append(new Grass());
            }
            break;
          case 2:
          case 4:
            this.items.append(new Fork({
              color: type === 2 ? 'yellow' : 'red',
              position: position.clone()
            }))
            break;
          case 8:
          case 16:
            tile = this.characters.append(new Hero({
              color: type === 8 ? 'alpha' : 'beta',
              position: position.clone()
            }));
            
            if (type === 8) {
              this.heroAlpha = tile;
            } else {
              this.heroBeta = tile;
            }
            break;
          case 32:
          case 64:
            this.characters.append(new Nemesis({
              color: type === 32 ? 'alpha' : 'beta',
              position: position.clone()
            }));
            break;
          case 1:
            this.walls.append(new Wall({
              neighbors: this.neighbors(index),
              position: position
            }));
            break;
          
        }
      }, this);
    },
    dispose: function() {
      Entity.prototype.dispose.apply(this, arguments);
      this.tiles = null;
      this.floor = null;
      this.walls = null;
      this.items = null;
    },
    highlight: function(position, distance) {
      var tile;
      var neighbors;

      if (this.is(position, World.tile.WALL) ||
          this.is(position, World.tile.HIGHLIGHT)) {
        return;
      }

      tile = new Graphic({
        url: '/assets/images/highlight.png',
        position: position.clone()
      });

      this.highlights.append(tile);
      this.or(position, World.tile.HIGHLIGHT);
      
      if (distance > 0) {
        neighbors = this.neighborPositions(position);

        while (neighbors.length) {
          this.highlight(neighbors.pop(), distance - 1);
        }
      }
    },
    clearHighlight: function() {
      while (this.highlights.firstChild) {
        this.xor(this.highlights.firstChild.position, 
                 World.tile.HIGHLIGHT);
        this.highlights.remove(this.highlights.firstChild);
      }
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
    is: function(position, value) {
      return !!(this.at(position) & value);
    },
    or: function(position, value) {
      this.tiles[this.positionToIndex(position)] = this.at(position) | value;
    },
    xor: function(position, value) {
      this.tiles[this.positionToIndex(position)] = this.at(position) ^ value;
    },
    isInBounds: function(position) {
      return this.positionToIndex(position) < this.tiles.length;
    },
    neighborPositions: function(position) {
      var neighbors = [];

      position = position.clone();
      position.x = position.x + 1;
      if (this.isInBounds(position)) {
        neighbors.push(position);
      }
      position = position.clone();
      position.x = position.x - 2;
      if (this.isInBounds(position)) {
        neighbors.push(position);
      }
      position = position.clone();
      position.x = position.x + 1;
      position.y = position.y - 1;
      if (this.isInBounds(position)) {
        neighbors.push(position);
      }
      position = position.clone();
      position.y = position.y + 2;
      if (this.isInBounds(position)) {
        neighbors.push(position);
      }

      return neighbors;
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
  }, {
    tile: {
      SAND: 0,
      WALL: 1,
      HIGHLIGHT: 3
    }
  });

  return World;
});
