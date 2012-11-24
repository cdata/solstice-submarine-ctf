define('game/entity/waypoint',
       ['underscore', 'game/graphic', 'game/vector2'],
       function(_, Graphic, Vector2) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/waypoint.png'
      });
      Graphic.prototype.initialize.call(this, options);
    },
    dispose: function() {
      this.redraw();
      console.log('Dispose');
      Graphic.prototype.dispose.apply(this, arguments);
    },
    invalidateDirection: function(last, next) {
      var lastUnit = this.position.clone().subtract(last);
      var nextUnit = next ? next.clone().subtract(this.position) : new Vector2(0, 0);

      if (Math.abs(lastUnit.x) === 1 && Math.abs(nextUnit.x) === 1) {
        this.sprite.goTo(2);
        this.rotation = Math.PI / 2;
      } else if (Math.abs(lastUnit.y) === 1 && Math.abs(nextUnit.y) === 1) {
        this.sprite.goTo(2);
      } else if (lastUnit.y === 1 && nextUnit.x === 1) {
        this.sprite.goTo(0);
      } else if (lastUnit.y === 1 && nextUnit.x === -1) {
        this.sprite.goTo(0);
        this.rotation = Math.PI;
      } else if (lastUnit.y === -1 && nextUnit.x === 1) {
        this.sprite.goTo(0);
      } else if (lastUnit.y === -1 && nextUnit.x === -1) {
        this.sprite.goTo(0);
        this.rotation = Math.PI / 2;
      } else if (lastUnit.x === 1 && nextUnit.y === -1) {
        this.sprite.goTo(0);
        this.rotation = Math.PI;
      } else if (lastUnit.x === -1 && nextUnit.y === -1) {
        this.sprite.goTo(0);
        this.rotation = -Math.PI / 2;
      } else if (lastUnit.x === 1 && nextUnit.y === 1) {
        this.sprite.goTo(0);
        this.rotation = Math.PI / 2;
      }
      
      if (nextUnit.x === 0 && nextUnit.y === 0) {
        if (lastUnit.x === -1) {
          this.rotation = Math.PI;
        } else if (lastUnit.x === 1) {
          this.rotation = 0;
        } else if (lastUnit.y === -1) {
          this.rotation = -Math.PI / 2;
        } else if (lastUnit.y === 1) {
          this.rotation = Math.PI / 2;
        }
        this.sprite.goTo(1);
      }

      this.redraw();
    }
  });
});
