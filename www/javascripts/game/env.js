define('game/env',
       ['game/object', 'game/entity', 'game/graphic', 'three', 'underscore', 'jquery', 'backbone'],
       function(GameObject, Entity, Graphic, THREE, _, $, Backbone) {
  
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
    initialize: function(options) {
      _.defaults(options || {}, {
        width: 800,
        height: 400
      });

      GameObject.prototype.initialize.apply(this, arguments);

      this.pixelRatio = window.pixelRatio || 1;
      this.graphicRatio = 2;

      this.width = options.width * this.graphicRatio;
      this.height = options.height * this.graphicRatio;

      this.pressedKeys = 0;

      // TODO: Use Three.js for rendering?
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.width = this.width / this.pixelRatio + 'px';
      this.canvas.style.height = this.height / this.pixelRatio + 'px';
      this.context = this.canvas.getContext('2d');

      this.$window = $(window);
      this.$body = $(document.body);
      this.$root = $('#Game');
      this.$canvas = $(this.canvas);

      // Set the scale based on device pixel ratio..
      this.context.scale(this.pixelRatio, this.pixelRatio);

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
    draw: function(entity) {
      if (entity && entity instanceof Graphic) {
        var x = entity.position.x * this.graphicRatio;
        var y = entity.position.y * this.graphicRatio;
        var w = entity.width * this.graphicRatio;
        var h = entity.height * this.graphicRatio;
        var w2 = w / this.graphicRatio;
        var h2 = h / this.graphicRatio;
        var r = entity.rotation;
        this.context.translate(x + w2, y + h2);
        this.context.rotate(r);
        this.context.drawImage(
          entity.sprite.image,
          entity.sprite.clipRect.getX(),
          entity.sprite.clipRect.getY(),
          entity.sprite.clipRect.getWidth(),
          entity.sprite.clipRect.getHeight(),
          -w2,
          -h2,
          w,
          h
        );
        this.context.rotate(-r);
        this.context.translate(-x - w2, -y - h2);
      }
    },
    drawScene: function(node) {
      if (node) {
        var iter = node;
        var x;
        var y;

        do {
          x = 0;
          y = 0;

          if (iter instanceof Entity) {
            x = iter.position.x * this.graphicRatio;
            y = iter.position.y * this.graphicRatio;
          }

          this.draw(iter);

          this.context.translate(x, y);
          this.drawScene(iter.firstChild);
          this.context.translate(-x, -y);
        } while (iter = iter.nextSibling);
      }
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
