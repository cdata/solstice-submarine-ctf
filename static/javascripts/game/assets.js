define('game/assets', 
       ['underscore', 'game/object'],
       function(_, GameObject) {
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
