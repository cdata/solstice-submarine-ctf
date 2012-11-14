define('game/assets', 
       ['underscore', 'three', 'game/object'],
       function(_, THREE, GameObject) {
  var Assets = GameObject.extend({
    initialize: function() {
      this.assets = {};
    },
    dispose: function() {
      this.assets = null;
    },
    registerAsset: function(url, asset) {
      this.assets[url] = asset;
    },
    getTexture: function(url) {
      var image = this.getImage(url);
      var texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      return texture;
    },
    getData: function(url) {
      return this.cloneData(this.assets[url]);
    },
    getImage: function(url) {
      return this.cloneImage(this.assets[url]);
    },
    cloneImage: function(image) {
      return image;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

      return canvas;
    },
    cloneData: function(data) {
      return _.clone(data);
    }
  });

  // This assets cache is a singleton for now..
  return new Assets();
});
