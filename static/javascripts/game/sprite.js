define('game/sprite',
       ['underscore', 'game/rectangle', 'game/object', 'game/assets'],
       function(_, Rectangle, GameObject, assets) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        url: 'assets/images/test.png',
        width: 80,
        height: 80
      });
      this.url = options.url;
      this.image = assets.getImage(options.url);
      this.imageWidth = this.image.width || 400;
      this.imageHeight = this.image.height || 400;
      this.cellWidth = options.width;
      this.cellHeight = options.height;
      this.unitWidth = Math.floor(this.imageWidth / this.cellWidth);
      this.unitHeight = Math.floor(this.imageHeight / this.cellHeight);
      this.currentIndex = 0;

      this.clipRect = new Rectangle();

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
        this.currentIndex = index;
      }
    }
  });
});
