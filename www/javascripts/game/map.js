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
        var sand = new Graphic('/assets/images/floor.png');
        var wall;
        sand.position.x = (index % this.width);
        sand.position.y = (Math.floor((index - sand.position.x) / this.width));
        sand.position.multiplyScalar(sand.width);
        this.floor.append(sand);

        if (type == 1) {
          wall = new Graphic('/assets/images/walls.png');
          wall.position.x = sand.position.x;
          wall.position.y = sand.position.y;
          this.walls.append(wall);
        }
      }, this);
    }
  });
});
