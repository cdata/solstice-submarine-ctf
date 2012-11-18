define('game/loader',
       ['game/object', 'q', 'underscore', 'backbone', 'jquery'], 
       function(GameObject, q, _, Backbone, $) {
  var Loader = GameObject.extend({
    initialize: function() {
      this.isIE = $.browser.msie;
      this.isFF = $.browser.mozilla;
      this.list = [];
    },
    dispose: function() {
      delete this.list;
    },
    load: function(list) {
      var queue = q.resolve();
      var loader = this;
      var url;

      this.list = list || this.list;
      this.remainingItems = this.list.length;

      do {
        (function(url, remaining) {
          var type = /.json$/.test(url) ? 'data' : 'image';
          queue = queue.then(_.bind(function() {
            return this.loadOne(url, type).then(_.bind(function(data) {
              this.trigger('loaded', data);
              this.remainingItems = remaining;
            }, this));
          }, this));
        }).call(this, this.list.shift(), this.list.length);
      } while (this.list.length);

      queue = queue.then(_.bind(function() {
        this.trigger('done');
      }, this));

      return queue;
    },
    loadOne: function(url, type) {
      this.trigger('loading', url);

      var result = q.defer();
      var image;

      console.log('Loading ' + type + ': ' + url);

      if (type == 'data') {
        $.get(url, function(data) {
          result.resolve({
            data: data,
            type: type,
            url: url
          })
        });
      } else {
        image = new Image();
        image.onload = function() {
          result.resolve({
            data: image,
            type: type,
            url: url
          });
        };
        image.src = url;
      }

      return result.promise;
    }
  });

  _.extend(Loader.prototype, Backbone.Events);

  return Loader;
});
