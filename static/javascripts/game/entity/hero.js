define('game/entity/hero',
       ['underscore', 'q', 'game/graphic/animated', 'tween', 'game/vector2', 'model/game/move', 'game/entity/waypoint'],
       function(_, q, AnimatedGraphic, TWEEN, Vector2, MoveModel, Waypoint) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Hero',
        url: 'assets/images/yellow-sub.png',
        frameInterval: 700,
        revealDistance: 5
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('idle-blur', 0, 1);
      this.defineFrameAnimation('idle-focus', 2, 3);

      this.model = new MoveModel();
      this.waypointTiles = [];

      this.model.on('change:points', this.updateWaypointTiles, this);

      this.blur();
    },
    blur: function() {
      this.useFrameAnimation('idle-blur');
    },
    focus: function() {
      this.useFrameAnimation('idle-focus');
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
