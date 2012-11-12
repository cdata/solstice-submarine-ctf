define('game/map', 
       ['game/entity', 'game/graphic', 'game/assets'], 
       function(Entity, Graphic, assets) {
  return Entity.extend({
    initialize: function(url) {
      Entity.prototype.initialize.call(this, 'Map');

      this.data = assets.getData(url);
      this.width = this.data.width;
      this.height = this.data.height;
      this.floor = this.append(new Entity('Floor'));
      this.walls = this.append(new Entity('Walls'));

      _.each(this.data.tiles, function(type, index) {
        var position = this.indexToPosition(index);
        var sand = new Graphic('/assets/images/floor.png');

        position.multiplyScalar(sand.width);
        sand.position.x = position.x;
        sand.position.y = position.y;

        this.floor.append(sand);

        if (type == 1) {
          wall = new Graphic('/assets/images/walls.png');
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
