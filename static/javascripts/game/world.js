define('game/world',
       ['underscore', 'game/entity', 'game/graphic', 'game/assets', 'game/entity/wall', 'game/entity/fork', 'game/entity/hero', 'game/entity/nemesis', 'game/entity/grass', 'game/entity/highlight', 'game/entity/fog', 'game/vector2', 'game/entity/waypoint'],
       function(_, Entity, Graphic, assets, Wall, Fork, Hero, Nemesis, Grass, Highlight, Fog, Vector2, Waypoint) {
  var World = Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'World',
        url: 'assets/data/seabound.json'
      });

      Entity.prototype.initialize.call(this, options);

      var data = assets.getData(options.url);

      this.tiles = data.tiles;
      this.width = data.width;
      this.height = data.height;
      this.foglessPositions = {};

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
      this.waypoints = this.append(new Entity({
        name: 'Waypoints'
      }));
      this.characters = this.append(new Entity({
        name: 'Characters'
      }));
      this.lasers = this.append(new Entity({
        name: 'Lasers'
      }));
      this.fogOfWar = this.append(new Entity({
        name: 'FogOfWar'
      }));

      _.each(this.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var tile;

        this.fogOfWar.append(new Fog({
          position: position.clone()
        }));

        this.or(position, World.tile.FOG);

        if (type !== World.tile.WALL) {
          tile = this.floor.append(new Graphic({
            name: 'Sand',
            url: 'assets/images/floor.png',
            position: position
          }));
        }

        switch (type) {
          case World.tile.SAND:
            if (Math.random() > 0.8) {
              tile.append(new Grass());
            }
            break;
          case World.tile.SUB_FORK:
          case World.tile.RKT_FORK:
            tile = this.items.append(new Fork({
              color: type === 2 ? 'yellow' : 'red',
              model: type === 2 ? options.subFork : options.rktFork,
              position: position.clone()
            }));

            tile.model.set('position', position.clone());

            if (type === 2) {
              this.subFork = tile;
            } else {
              this.rktFork = tile;
            }
            break;
          case World.tile.SUB_A:
          case World.tile.SUB_B:
            tile = this.characters.append(new Hero({
              color: type === 8 ? World.color.YELLOW : World.color.TEAL,
              url: type === 8 ? 'assets/images/yellow-sub.png' : 'assets/images/teal-sub.png',
              name: 'sub' + (type === 8 ? 'A' : 'B'),
              position: position.clone()
            }));

            tile.on('reveal', this.setFoglessPosition, this);

            if (type === 8) {
              this.subA = this.heroAlpha = tile;
            } else {
              this.subB = this.heroBeta = tile;
            }
            break;
          case World.tile.RKT_A:
          case World.tile.RKT_B:
            tile = this.characters.append(new Nemesis({
              name: 'rkt' + (type === 32 ? 'A' : 'B'),
              color: type === 32 ? World.color.RED : World.color.BLUE,
              position: position.clone()
            }));

            if (type == 32) {
              this.rktA = tile;
            } else {
              this.rktB = tile;
            }
            break;
          case World.tile.WALL:
            this.walls.append(new Wall({
              neighbors: this.neighbors(index),
              position: position
            }));
            break;
        }
      }, this);
    },
    dispose: function() {
      this.heroAlpha.off(null, null, this);
      this.heroBeta.off(null, null, this);

      this.floor = null;
      this.walls = null;
      this.items = null;
      this.highlights = null;
      this.waypoints = null;
      this.characters = null;
      this.fogOfWar = null;

      this.heroAlpha = null;
      this.heroBeta = null;
      this.subA = null;
      this.subB = null;
      this.rktA = null;
      this.rktB = null;

      Entity.prototype.dispose.apply(this, arguments);
    },
    updateFog: function() {
      var index = 0;
      var iter;
      var position;
      var neighbors;
      var secondNeighbors;
      var circle;
      var hasFog;
      var name;

      while (index < this.tiles.length) {
        position = this.indexToPosition(index);
        hasFog = true;

        for (name in this.foglessPositions) {
          circle = this.foglessPositions[name];
          if (position.distanceTo(circle.position) < circle.radius &&
              this.lineOfSight(circle.position, position)) {
            hasFog = false;
          }
        }

        if (hasFog) {
          this.or(position, World.tile.FOG);
        } else if (this.is(position, World.tile.FOG)){
          this.xor(position, World.tile.FOG);
        }

        index++;
      }

      iter = this.fogOfWar.firstChild;

      do {
        hasFog = this.is(iter.position, World.tile.FOG);

        iter.invalidateNeighbors(this.inclusiveNeighbors(this.positionToIndex(iter.position)));

        if (hasFog !== iter.visible) {
          iter.visible = hasFog;
          iter.redraw();
        }
      } while (iter = iter.nextSibling);
    },
    setFoglessPosition: function(name, circle) {
      this.foglessPositions[name] = circle;
      this.updateFog();
    },
    lineOfSight: function(start, finish) {
      var iter = start.clone();
      var interval = finish.clone().subtract(start).normalize();
      var rounded = iter.clone().round();

      while (!rounded.equals(finish)) {
        if (this.is(rounded, World.tile.WALL))
          return false;

        iter.add(interval);
        rounded = iter.clone().round();
      }
      return true;
    },
    printMap: function() {
      var row = ['    '];
      var axis = '    ';
      for (var index = 0; index < this.width; index++) {
        row.push('    '.substr(0, 4 - index.toString().length) + index);
        axis += '-----';
      }
      console.log(row.join(' '));
      console.log(axis);
      row = [];
      for (index = 0; index < this.tiles.length; index++) {
        if (index % this.width === 0) {
          row.push(Math.floor(index / this.width) + ' |');
        }
        row.push(this.tiles[index]);
        if (row.length - 1 === this.width) {
          console.log(_.map(row, function(tile) {
            return '    '.substr(0, 4 - tile.toString().length) + tile
          }).join(' '));
          row = [];
        }
      }
    },
    placeHighlightTile: function(position, distance, color) {
      var tile;
      var neighbors;

      if (this.is(position, World.tile.WALL)) {
        return;
      }

      if (!this.is(position, World.tile.HIGHLIGHT)) {
        tile = new Highlight({
          position: position.clone(),
          color: color
        });

        tile.on('click', this.handleHighlightClick, this);

        this.highlights.append(tile).redraw();
        this.or(position, World.tile.HIGHLIGHT);
      }

      if (distance > 0) {
        neighbors = this.neighborPositions(position);
        while (neighbors.length) {
          this.placeHighlightTile(neighbors.pop(), distance - 1, color);
        }
      }
    },
    highlight: function(position, distance, color) {
      var iter;

      this.clearHighlight();
      this.placeHighlightTile(position, distance, color);

      iter = this.highlights.firstChild;

      do {
        iter.invalidateNeighbors(this.neighbors(this.positionToIndex(iter.position)));
      } while (iter = iter.nextSibling);
    },
    clearHighlight: function() {
      while (this.highlights.firstChild) {
        this.xor(this.highlights.firstChild.position,
                 World.tile.HIGHLIGHT);
        this.highlights.firstChild.redraw();
        this.highlights.firstChild.off('click', this.handleHighlightClick, this);
        this.highlights.remove(this.highlights.firstChild);
      }
    },
    handleHighlightClick: function(tile) {
      this.trigger('click:highlight', tile.position);
    },
    indexToPosition: function(index) {
      var position = new Vector2();
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
      return position.x > -1 && position.x < this.width &&
             position.y > -1 && position.y < this.height &&
             this.positionToIndex(position) < this.tiles.length;
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
    },
    inclusiveNeighbors: function(index) {
      var position = this.indexToPosition(index);
      var result = this.neighbors(index);
      
      position.x = position.x - 1;
      position.y = position.y - 1;
      result.topLeft = this.at(position);
      position.x = position.x + 2;
      result.topRight = this.at(position);
      position.y = position.y + 2;
      result.bottomRight = this.at(position);
      position.x = position.x - 2;
      result.bottomLeft = this.at(position);

      return result;
    },
    getCost: function(from, to) {
      var interval = to.clone().subtract(from).normalize();
      var position = from.clone();
      var cost = 0;

      while (Math.round(position.x) !== to.x ||
             Math.round(position.y) !== to.y) {
        position.x += interval.x;
        position.y += interval.y;

        cost += this.is(new Vector2(Math.round(position.x), Math.round(position.y)),
                        World.tile.WALL) ? 1 : 0;
      }

      cost += from.distanceTo(to);

      return cost;
    },
    getNextStepCost: function(from, to, exclude) {
      var neighborPositions;
      var neighborPosition;
      var nextWeight;
      var weight;
      var next;
      var index;
      var exclusion;

      neighborPositions = this.neighborPositions(from);
      nextWeight = 1000;
      
      while (neighborPosition = neighborPositions.pop()) {
        if (this.is(neighborPosition, World.tile.WALL)) {
          continue;
        }

        for (index = 0, exclusion = exclude[index];
             index < exclude.length; exclusion = exclude[++index]) {
          if (exclusion.equals(neighborPosition)) {
            break;
          }
        }

        if (exclusion) {
          continue;
        }

        weight = this.getCost(neighborPosition, to);

        if (!next || weight < nextWeight) {
          next = neighborPosition; 
          nextWeight = weight;
        }
      }

      return next ? nextWeight : 1000;
    },
    getPath: function(from, to, list, exclude) {
      var neighborPositions;
      var neighborPosition;
      var nextWeight;
      var weight;
      var next;
      var index;
      var exclusion;

      if (this.is(from, World.tile.WALL) ||
          this.is(to, World.tile.WALL) ) {
        return list;
      }

      neighborPositions = this.neighborPositions(from);
      nextWeight = 1000;
      
      list = list || [];
      exclude = exclude || [from];

      while (neighborPosition = neighborPositions.pop()) {
        if (neighborPosition.equals(to)) {
          next = neighborPosition;
          nextWeight = 0;
          break;
        }

        if (this.is(neighborPosition, World.tile.WALL)) {
          continue;
        }

        for (index = 0, exclusion = exclude[index];
             index < exclude.length; exclusion = exclude[++index]) {
          if (exclusion.equals(neighborPosition)) {
            break;
          }
        }

        if (exclusion) {
          continue;
        }

        exclude.push(neighborPosition);

        weight = this.getCost(neighborPosition, to) + this.getNextStepCost(neighborPosition, to, exclude);

        if (!next || weight < nextWeight) {
          next = neighborPosition;
          nextWeight = weight;
        }
      }

      if (next) {
        list.push(next);

        if (nextWeight > 0) {
          list = this.getPath(next, to, list, exclude);
        }
      }

      return list;
    },
    companionOf: function(hero) {
      // TODO: Accomodate for nemesis..
      return hero === this.heroAlpha ? this.heroBeta : this.heroAlpha;
    }
  }, {
    tile: {
      SAND: 0,
      WALL: 1,
      SUB_FORK: 2,
      RKT_FORK: 4,
      SUB_A: 8,
      SUB_B: 16,
      RKT_A: 32,
      RKT_B: 64,
      HIGHLIGHT: 128,
      WAYPOINT: 256,
      FOG: 512
    },
    color: {
      YELLOW: 0,
      TEAL: 6,
      RED: 12,
      BLUE: 18
    }
  });

  return World;
});
