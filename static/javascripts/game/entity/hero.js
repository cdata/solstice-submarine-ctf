define('game/entity/hero',
       ['underscore', 'q', 'game/graphic/animated', 'tween'],
       function(_, q, AnimatedGraphic, TWEEN) {
  return AnimatedGraphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Hero',
        url: 'assets/images/yellow-sub.png',
        frameInterval: 700
      });

      AnimatedGraphic.prototype.initialize.call(this, options);

      this.defineFrameAnimation('idle-blur', 0, 1);
      this.defineFrameAnimation('idle-focus', 2, 3);

      this.blur();
    },
    blur: function() {
      this.useFrameAnimation('idle-blur');
    },
    focus: function() {
      this.useFrameAnimation('idle-focus');
    },
    moveTo: function(destination) {
      var movement = q.resolve();
      var unit = new THREE.Vector2(1, 0);
      var destUnit = destination.clone().subSelf(this.position).normalize();
      var rotation = (Math.acos(unit.dot(destUnit) / (unit.length() * destUnit.length())));

      if (destUnit.y === -1)
        rotation *= -1;

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
        this.tween = new TWEEN.Tween(this.position)
          .to({ x: destination.x, y: destination.y }, Math.abs(this.position.distanceTo(destination)) * 250)
          .onUpdate(_.bind(this.redraw, this))
          .onComplete(function() {
            result.resolve();
          })
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

          lastNormal = lastWaypoint.clone().subSelf(previousWaypoint).normalize();
          normal = path[index].clone().subSelf(lastWaypoint).normalize();

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
    }
  });
});
