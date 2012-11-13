define('game/renderer',
       ['game/object', 'game/node', 'game/entity', 'game/graphic', 'three', 'underscore', 'jquery', 'backbone'],
       function(GameObject, Node, Entity, Graphic, THREE, _, $, Backbone) {
  
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

  var Renderer = GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        width: 720,
        height: 360
      });

      GameObject.prototype.initialize.apply(this, arguments);

      this.pixelRatio = window.pixelRatio || 1;
      this.graphicRatio = 2;

      this.width = options.width * this.graphicRatio;
      this.height = options.height * this.graphicRatio;

      this.pressedKeys = 0;
      this.rendered = false;

      // TODO: Use Three.js for rendering?
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.width = this.width / this.pixelRatio + 'px';
      this.canvas.style.height = this.height / this.pixelRatio + 'px';
      this.context = this.canvas.getContext('2d');
      this.sceneRoot = new Node();
      this.redrawRectangles = null;
      this.translations = [];
      this.rotations = [];
      this.translationOrigin = new THREE.Vector2();
      this.rotationOrigin = 0;

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

      this.redrawRectangles = null;
      this.translations = null;
      this.rotations = null;
      this.translationOrigin = null;
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
        var drawRect = new THREE.Rectangle();

        drawRect.set(-w2, -h2, -w2 + w, -h2 + h);

        if (!this.rendered || this.shouldRedraw(drawRect)) {
          this.pushTranslation(new THREE.Vector2(x + w2, y + h2));
          r && this.pushRotation(r);

          this.context.drawImage(
            entity.sprite.image,
            entity.sprite.clipRect.getX(),
            entity.sprite.clipRect.getY(),
            entity.sprite.clipRect.getWidth(),
            entity.sprite.clipRect.getHeight(),
            drawRect.getX(),
            drawRect.getY(),
            drawRect.getWidth(),
            drawRect.getHeight()
          );

          r && this.popRotation();
          this.popTranslation();
        }
      }
    },
    drawScene: function(node) {
      if (node) {
        var iter = node;
        var x;
        var y;
        var r;

        do {
          x = 0;
          y = 0;
          r = 0;

          if (iter instanceof Entity && !iter instanceof Graphic) {
            x = iter.position.x * this.graphicRatio;
            y = iter.position.y * this.graphicRatio;
            r = iter.rotation;
          }

          this.draw(iter);

          this.pushTranslation(new THREE.Vector2(x, y));
          r && this.pushRotation(r);

          this.drawScene(iter.firstChild);

          r && this.popRotation();
          this.popTranslation();

        } while (iter = iter.nextSibling);
      }
    },
    render: function() {
      this.drawScene(this.sceneRoot);
      this.cleanup();
    },
    cleanup: function() {
      this.rendered = true;
      this.redrawRectangles = null;
    },
    pushTranslation: function(translation) {
      if (translation) {
        this.context.translate(translation.x, translation.y);
        this.translationOrigin.add(this.translationOrigin, translation);
        this.translations.push(translation);
      }
    },
    popTranslation: function() {
      var translation = this.translations.pop();
      this.translationOrigin.sub(this.translationOrigin, translation);
      this.context.translate(-translation.x, -translation.y);
      return translation;
    },
    pushRotation: function(rotation) {
      if (rotation) {
        this.context.rotate(rotation);
        this.rotationOrigin += r;
        this.rotations.push(rotation);
      }
    },
    popRotation: function() {
      var rotation = this.rotations.pop();
      this.rotationOrigin -= rotation;
      this.context.rotate(-rotation);
      return rotation;
    },
    pushRedrawRectangle: function(rect) {
      if (rect) {
        var iter = rect;
        rect.next = this.redrawRectangles;

        while (iter.next) {
          if (iter.next.intersects(rect)) {
            rect.addRectangle(iter.next);
            iter.next = iter.next.next;
          } else {
            iter = iter.next;
          }
        }
      }
    },
    adjusted: function(rect) {
      return new THREE.Rectangle(
        rect.getLeft() + this.translationOrigin.x,
        rect.getTop() + this.translationOrigin.y,
        rect.getRight() + this.translationOrigin.x,
        rect.getBottom() + this.translationOrigin.y
      );
    },
    shouldRedraw: function(rect) {
      var iter;

      if (!this.rendered) {
        return true;
      }

      if (!this.redrawRectangles) {
        return false;
      }

      iter = this.redrawRectangles;
      rect = this.adjusted(rect);

      do {
        if (rect.intersects(iter)) {
          return true;
        }
      } while (iter = iter.next);

      return false;
    },
    onResize: function(event) {
      // TODO: Respond to orientation change here..
    },
    onKeydown: function(event) {
      var key = event.which || event.keyCode;

      if (key in Renderer.Keys) {
        event.preventDefault();
        this.pressedKeys |= Renderer.Keys[key];
      }

      this.trigger('keydown');
    },
    onKeyup: function(event) {
      var key = event.which || event.keyCode;

      if (key in Renderer.Keys) {
        event.preventDefault();
        this.pressedKeys ^= Renderer.Keys[key];
      }

      this.trigger('keyup');
    }
  }, {
    Keys: Keys,
    Buttons: Buttons
  });

  _.extend(Renderer.prototype, Backbone.Events);

  return Renderer;
});
