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
      this.fogOfWar = this.append(new Entity({
        name: 'FogOfWar'
      }));

      _.each(this.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var tile;

        /*this.fogOfWar.append(new Fog({
          position: position.clone()
        }));*/

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
          case World.tile.YELLOW_FORK:
          case World.tile.RED_FORK:
            this.items.append(new Fork({
              color: type === 2 ? 'yellow' : 'red',
              position: position.clone()
            }))
            break;
          case World.tile.HERO_ALPHA:
          case World.tile.HERO_BETA:
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
          case World.tile.NEMESIS_ALPHA:
          case World.tile.NEMESIS_BETA:
            this.characters.append(new Nemesis({
              color: type === 32 ? 'alpha' : 'beta',
              position: position.clone()
            }));
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
      Entity.prototype.dispose.apply(this, arguments);
      this.tiles = null;
      this.floor = null;
      this.walls = null;
      this.items = null;
    },
    placeHighlightTile: function(position, distance) {
      var tile;
      var neighbors;

      if (this.is(position, World.tile.WALL)) {
        return;
      }

      if (!this.is(position, World.tile.HIGHLIGHT)) {
        tile = new Highlight({
          position: position.clone()
        });

        tile.on('click', this.handleHighlightClick, this);

        this.highlights.append(tile).redraw();
        this.or(position, World.tile.HIGHLIGHT);
      }
      
      if (distance > 0) {
        neighbors = this.neighborPositions(position);
        while (neighbors.length) {
          this.placeHighlightTile(neighbors.pop(), distance - 1);
        }
      }
    },
    highlight: function(position, distance) {
      var iter;

      this.clearHighlight();
      this.placeHighlightTile(position, distance);

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
    drawWaypointPath: function(start, points) {
      var last = start;
      var point;
      var index;

      for (index = 0, point = points[index]; index < points.length; point = points[++index]) {
        this.waypoints.append(new Waypoint({
          position: point.clone()
        })).invalidateDirection(last, points[index + 1]);
        last = point;
      }
    },
    revealFog: function(pointOne, pointTwo) {

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
        //window.app.currentView.game.renderer.context.fillStyle = '#0000ff';
        //window.app.currentView.game.renderer.context.fillRect(
            //next.x * 40 + 15, next.y * 40 + 15, 10, 10);
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
      YELLOW_FORK: 2,
      RED_FORK: 4,
      HERO_ALPHA: 8,
      HERO_BETA: 16,
      NEMESIS_ALPHA: 32,
      NEMESIS_BETA: 64,
      HIGHLIGHT: 128,
      WAYPOINT: 256,
      FOG: 512
    }
  });

  return World;
});
