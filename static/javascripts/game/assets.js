if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'jquery', 'game/object'],
       function(_, $, GameObject) {
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
      // Clone image data makes mobile devices cry. Oh well..
      return image;
    },
    cloneData: function(data) {
      // Send it out to jQuery's deep extend..
      return $.extend(true, {}, data);
    }
  });

  // This assets cache is a singleton for now..
  return new Assets();
});
