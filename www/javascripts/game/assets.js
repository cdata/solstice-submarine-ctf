define('game/assets', 
       ['underscore', 'three', 'game/object'],
       function(_, THREE, GameObject) {
  return GameObject.extend({
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
      var canvas = document.createElement(image);
      var context = canvas.getContext('2d');
      var clone = new Image();

      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);
      clone.url = canvas.toDataURL();

      return clone;
    },
    cloneData: function(data) {
      return _.clone(data);
    }
  });
});
