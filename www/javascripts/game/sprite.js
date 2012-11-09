define('game/sprite',
       ['three', 'game/object'],
       function(THREE, GameObject) {
  return GameObject.extend({
    initialize: function(url, imageWidth, imageHeight, cellWidth, cellHeight) {
      this.url = url;
      this.imageWidth = imageWidth;
      this.imageHeight = imageHeight;
      this.cellWidth = cellWidth;
      this.cellHeight = cellHeight;
      this.unitWidth = Math.floor(imageWidth / cellWidth);
      this.unitHeight = Math.floor(imageHeight / cellHeight);

      this.maxIndex = this.unitWidth * this.unitHeight - 1;
      
      this.texture = THREE.ImageUtils.loadTexture(url);
      this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
      this.texture.repeat.x = this.cellWidth / this.imageWidth;
      this.texture.repeat.y = this.cellHeight / this.imageHeight;

      this.material = new T.MeshBasicMaterial({ map: this.texture });
      this.material.transparent = true;
    },
    dispose: function() {
      delete this.material;
      delete this.texture;
    },
    goTo: function(index) {
      if (index < this.maxIndex) {
        var top = Math.floor(index / this.unitWidth);
        var left = index % this.unitWidth;

        this.texture.offset.x = left * this.cellWidth / this.imageWidth;
        this.texture.offset.y = top * this.cellHeight / this.imageHeight;
      }
    }
  });
});
