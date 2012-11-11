define('game/sprite',
       ['three', 'game/object', 'game/assets'],
       function(THREE, GameObject, assets) {
  return GameObject.extend({
    initialize: function(url, width, height) {
      this.url = url;
      this.image = assets.getImage(url);
      this.imageWidth = this.image.width || 400;
      this.imageHeight = this.image.height || 400;
      this.cellWidth = width;
      this.cellHeight = height;
      this.unitWidth = Math.floor(this.imageWidth / this.cellWidth);
      this.unitHeight = Math.floor(this.imageHeight / this.cellHeight);

      this.clipRect = new THREE.Rectangle();

      this.maxIndex = this.unitWidth * this.unitHeight - 1;
    },
    dispose: function() {
      this.image = null;
      this.clipRect = null;
    },
    goTo: function(index) {
      if (index < this.maxIndex) {
        var x = (index % this.unitWidth) * this.cellWidth;
        var y = Math.floor(index / this.unitWidth) * this.cellHeight;
        this.clipRect.set(x, y, x + this.cellWidth, y + this.cellHeight);
      }
    }
  });
});
