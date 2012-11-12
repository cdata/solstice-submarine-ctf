define('game/map', 
       ['underscore', 'game/entity', 'game/graphic', 'game/assets'], 
       function(_, Entity, Graphic, assets) {
  return Entity.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        name: 'Map',
        url: '/assets/data/seabound.json'
      });

      Entity.prototype.initialize.call(this, options);

      this.data = assets.getData(options.url);
      this.width = this.data.width;
      this.height = this.data.height;
      this.floor = this.append(new Entity());
      this.walls = this.append(new Entity());

      _.each(this.data.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var sand = new Graphic({ url: '/assets/images/floor.png' });

        position.multiplyScalar(sand.width);
        sand.position.x = position.x;
        sand.position.y = position.y;

        this.floor.append(sand);

        if (type == 1) {
          wall = new Graphic({ url: '/assets/images/walls.png' });
          wall.position.x = position.x;
          wall.position.y = position.y;

          this.walls.append(wall);
        }
      }, this);
    },
    indexToPosition: function(index) {
      var position = new THREE.Vector2();
      position.x = (index % this.width);
      position.y = Math.floor((index - position.x) / this.width);
      return position;
    },
    neighbors: function(index) {
      var position = this.indexToPosition(index);
    }
  });
});
