define('game/env',
       ['game/object', 'three', 'underscore', 'jquery', 'backbone'],
       function(GameObject, THREE, _, $, Backbone) {
  
  var Buttons = {
    LEFT: 1,
    UP: 2,
    RIGHT: 4,
    DOWN: 8,
    ARROW: 15,
    Z: 16,
    X: 32,
    A: 64,
    S: 128,
    SHIFT: 256,
    CTRL: 512,
    SPACE: 1024
  };

  var Keys = {
    16: Buttons.SHIFT,
    17: Buttons.CTRL,
    32: Buttons.SPACE,
    37: Buttons.LEFT,
    38: Buttons.UP,
    39: Buttons.RIGHT,
    40: Buttons.DOWN,
    65: Buttons.A,
    83: Buttons.S,
    88: Buttons.X,
    90: Buttons.Z
  };

  var Env = GameObject.extend({
    initialize: function(width, height) {
      GameObject.prototype.initialize.apply(this, arguments);
      this.pixelRatio = window.devicePixelRatio || 1;
      this.width = width || 0;
      this.height = height || 0;

      this.pressedKeys = 0;

      // TODO: Use WebGL if available maybe?
      this.renderer = new THREE.CanvasRenderer();
      this.canvas = this.renderer.domElement;
      this.context = this.canvas.getContext('2d');

      this.$window = $(window);
      this.$body = $(document.body);
      this.$root = $('#Game');
      this.$canvas = $(this.canvas);

      // Set the scale based on device pixel ratio..
      this.context.scale(this.pixelRatio, this.pixelRatio);

      // Initialize the renderer..
      this.renderer.setClearColorHex(0x000000, 1);
      this.renderer.setSize(this.width, this.height);

      // TODO: Media queries?
      this.$window.on('resize', _.bind(this.onResize, this));

      this.$body.on('keydown', _.bind(this.onKeydown, this));
      this.$body.on('keyup', _.bind(this.onKeyup, this));

      this.$root.prepend(this.$canvas);
    },
    dispose: function() {
      this.$window.off('resize');

      this.$canvas.remove();

      this.$canvas = null;
      this.canvas = null;
      this.context = null;
      this.renderer = null;

      this.$window = null;
      this.$body = null;
    },
    onResize: function(event) {
      // TODO: Respond to orientation change here..
    },
    onKeydown: function(event) {
      var key = event.which || event.keyCode;

      if (key in Env.Keys) {
        event.preventDefault();
        this.pressedKeys |= Env.Keys[key];
      }

      this.trigger('keydown');
    },
    onKeyup: function(event) {
      var key = event.which || event.keyCode;

      if (key in Env.Keys) {
        event.preventDefault();
        this.pressedKeys ^= Env.Keys[key];
      }

      this.trigger('keyup');
    }
  }, {
    Keys: Keys,
    Buttons: Buttons
  });

  _.extend(Env.prototype, Backbone.Events);

  return Env;
});
