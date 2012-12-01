define('game/entity/hero',
       ['underscore', 'q', 'game/graphic', 'game/graphic/animated', 'tween', 'game/vector2', 'model/game/move', 'game/entity/waypoint', 'game/entity/laser'],
       function(_, q, Graphic, AnimatedGraphic, TWEEN, Vector2, MoveModel, Waypoint, Laser) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Hero',
        url: 'assets/images/yellow-sub.png',
        frameInterval: 700,
        revealDistance: 9,
        color: 0
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('idle-blur', 0, 1);
      this.defineFrameAnimation('idle-focus', 2, 3);
      this.defineFrameAnimation('dead', 4, 4);
      this.defineFrameAnimation('die', 5, 10);
      this.defineFrameAnimation('respawn', 10, 5);

      this.shield = this.append(new Graphic({
        name: 'Shield',
        url: 'assets/images/laser.png'
      }));
      this.shield.sprite.goTo(10);
      this.shield.visible = false;

      this.model = new MoveModel({
        unit: this.name
      });

      this.color = options.color;
      this.waypointTiles = [];
      this.laserTiles = [];

      this.model.on('change:points', this.updateWaypointTiles, this);

      this.blur();
    },
    getCurrentMove: function() {
      this.model.set('start', this.position.clone());
      return this.model;
    },
    blur: function() {
      this.useFrameAnimation('idle-blur');
    },
    focus: function() {
      this.useFrameAnimation('idle-focus');
    },
    draw: function() {
      var iter = this.firstChild;
      if (iter) {
        // Lazy fix for child rotation..
        do {
          iter.rotation = this.rotation;
        } while (iter = iter.nextSibling);
      }
      AnimatedGraphic.prototype.draw.apply(this, arguments);
    },
    checkForPositionChange: function() {
      var flatPosition = new Vector2(Math.floor(this.position.x), Math.floor(this.position.y));

      if (this.oldPosition && this.oldPosition.equals(flatPosition)) {
        return;
      }

      this.oldPosition = flatPosition;
      this.reveal();
    },
    moveTo: function(destination) {
      var movement = q.resolve();
      var unit = new Vector2(1, 0);
      var destUnit = destination.clone().subtract(this.position).normalize();
      var rotation = (Math.acos(unit.dot(destUnit) / (unit.length() * destUnit.length())));

      if (destUnit.y === -1) {
        rotation *= -1;
      }

      if (rotation !== this.rotation) {
        movement = movement.then(_.bind(function() {
          var result = q.defer();
          this.tween = new TWEEN.Tween(this)
            .to({ rotation: rotation }, 100)
            .onUpdate(_.bind(this.redraw, this))
            .onComplete(function() {
              result.resolve();
            })
            .start();
          return result.promise;
        }, this));
      }

      movement = movement.then(_.bind(function() {
        var result = q.defer();
        var positionProxy = this.position.clone();
        this.tween = new TWEEN.Tween(positionProxy)
          .to({ x: destination.x, y: destination.y }, Math.abs(this.position.distanceTo(destination)) * 250)
          //.onUpdate(_.bind(this.redraw, this))
          .onUpdate(_.bind(function() {
            this.redraw();
            this.position.x = positionProxy.x;
            this.position.y = positionProxy.y;
            this.checkForPositionChange();
            this.redraw();
          }, this))
          .onComplete(_.bind(function() {
            this.checkForPositionChange();
            result.resolve();
          }, this))
          .start();
        return result.promise;
      }, this));

      return movement
    },
    walkPath: function(path) {
      var start = this.position;
      var waypoints = [];
      var moves = q.resolve();
      var lastNormal;
      var normal;
      var point;
      var index;

      for (index = 0; index < path.length; index++) {
        if (!waypoints.length) {
          waypoints.push(path[index].clone());
        } else {
          lastWaypoint = waypoints[waypoints.length - 1];
          previousWaypoint = waypoints[waypoints.length -2] || start;

          lastNormal = lastWaypoint.clone().subtract(previousWaypoint).normalize();
          normal = path[index].clone().subtract(lastWaypoint).normalize();

          if (lastNormal.equals(normal)) {
            lastWaypoint.x += normal.x;
            lastWaypoint.y += normal.y;
          } else {
            waypoints.push(path[index].clone());
          }
        }
      }

      while (point = waypoints.shift()) {
        _.bind(function(point) {
          moves = moves.then(_.bind(function() {
            return this.moveTo(point);
          }, this));
        }, this)(point)
      }

      return moves;
    },
    die: function() {
      var result = q.defer();
      this.useFrameAnimation('die', 150, _.bind(function() {
        this.useFrameAnimation('dead', 100000);
        result.resolve();
      }, this));
      return result.promise;
    },
    respawn: function() {
      var result = q.defer();
      this.useFrameAnimation('respawn', 150, _.bind(function() {
        this.blur();
        result.resolve();
      }, this));
      return result.promise;
    },
    clearLaser: function() {
      var iter;

      while (iter = this.laserTiles.pop()) {
        iter.redraw();
        iter.parent.remove(iter);
        iter.dispose();
      }
    },
    fireLaser: function(at) {
      var direction = at.clone().subtract(this.position).normalize();
      var point = this.position.clone();
      var first = true;
      var result = q.defer();
      var segment;
      var laserTile;

      this.clearLaser();

      while (!point.equals(at)) {
        segment = 1;
        point.add(direction);
        if (point.equals(at)) {
          if (first) {
            segment = 3;
          } else {
            segment = 2;
          }
        } else if (first) {
          segment = 0;
        }
        laserTile = new Laser({
          position: point.clone(),
          direction: direction,
          segment: segment
        });
        this.parent.parent.lasers.append(laserTile);
        this.laserTiles.push(laserTile);

        laserTile.redraw();
        first = false;
      }

      _.delay(_.bind(function() {
        this.clearLaser();
        result.resolve();
      }, this), 1000)

      return result.promise;
    },
    clearWaypointTiles: function() {
      var iter;
      while (iter = this.waypointTiles.pop()) {
        iter.redraw();
        iter.parent.remove(iter);
        iter.dispose();
      }
    },
    updateWaypointTiles: function() {
      var points = this.model.get('points');
      var last = this.position;
      var waypointTile;
      var point;
      var index;

      this.clearWaypointTiles();

      for (index = 0, point = points[index]; index < points.length; point = points[++index]) {
        waypointTile = new Waypoint({
          position: point
        });
        this.parent.parent.waypoints.append(waypointTile);
        this.waypointTiles.push(waypointTile);
        waypointTile.redraw();

        waypointTile.invalidateDirection(last, points[index + 1]);

        last = point;
      }
    }
  });
});
