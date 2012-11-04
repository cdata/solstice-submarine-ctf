define('game/env',
       ['game/object', 'jquery'],
       function(GameObject, $) {
  return GameObject.extend({
    initialize: function(width, height) {
      GameObject.prototype.initialize.apply(this, arguments);

      this.width = width || 0;
      this.height = height || 0;

      this.$window = $(window);
      this.$body = $(document.body);

      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      // TODO: Media queries?
      this.$window.bind('resize', this.onResize_, this);

      // Canvas size should be advised by Env dimensions..
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.$body.prepend(this.canvas);
    },
    dispose: function() {
      $(this.canvas).remove();
      this.$window.unbind('resize', this.onResize_, this);

      delete this.canvas;
      delete this.context;

      delete this.$window;
      delete this.$body;
    },
    onResize_: function() {
      // TODO: Respond to orientation change here..
    }
  });
});
