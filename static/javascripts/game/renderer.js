define('game/renderer',
       ['game/object', 'game/node', 'game/entity', 'game/graphic', 'game/vector2', 'game/rectangle', 'underscore', 'jquery', 'backbone'],
       function(GameObject, Node, Entity, Graphic, Vector2, Rectangle, _, $, Backbone) {

  var Renderer = GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        width: 720,
        height: 360
      });

      GameObject.prototype.initialize.apply(this, arguments);

      this.canvas = document.createElement('canvas');
      this.options = options;

      if (window.matchMedia) {
        this.matchTinyScreen = window.matchMedia('(max-width: 539px)');
        this.matchSmallScreen = window.matchMedia('(min-width: 540px) and (max-width: 719px)');
        this.matchMediumScreen = window.matchMedia('(min-width: 720px) and (max-width: 1599px)');
        this.matchLargeScreen = window.matchMedia('(min-width: 1600px)');

        this.boundInvalidateRatios = _.bind(this.invalidateRatios, this);

        this.matchTinyScreen.addListener(this.boundInvalidateRatios);
        this.matchSmallScreen.addListener(this.boundInvalidateRatios);
        this.matchMediumScreen.addListener(this.boundInvalidateRatios);
        this.matchLargeScreen.addListener(this.boundInvalidateRatios);
      }

      this.pressedKeys = 0;
      this.rendered = false;

      this.context = this.canvas.getContext('2d');
      this.sceneRoot = new Node();
      this.redrawRectangles = null;
      this.revealedLocations = {};
      this.translations = [];
      this.rotations = [];
      this.translationOrigin = new Vector2();
      this.rotationOrigin = 0;
      this.clickX = -1;
      this.clickY = -1;

      this.boundHandleClick = _.bind(this.handleClick, this);

      this.$window = $(window);
      this.$body = $(document.body);
      this.$root = $('#Game');
      this.$canvas = $(this.canvas);
      this.$canvas.on('click', this.boundHandleClick);

      this.invalidateRatios();

      this.sceneRoot.on('draw', this.pushRedrawRectangle, this);
      this.sceneRoot.on('reveal', this.setRevealedLocation, this);

      this.$root.prepend(this.$canvas);
    },
    dispose: function() {
      this.sceneRoot.off('draw', this.pushRedrawRect, this);

      if (window.matchMedia) {
        this.matchTinyScreen.removeListener(this.boundInvalidateRatios);
        this.matchSmallScreen.removeListener(this.boundInvalidateRatios);
        this.matchMediumScreen.removeListener(this.boundInvalidateRatios);
        this.matchLargeScreen.removeListener(this.boundInvalidateRatios);

        this.boundInvalidateRatios = null;

        this.matchTinyScreen = null;
        this.matchSmallScreen = null;
        this.matchMediumScreen = null;
        this.matchLargeScreen = null;
      }

      this.$canvas.off('click', this.boundHandleClick);
      this.$canvas.remove();

      this.boundHandleClick = null;

      this.$canvas = null;
      this.canvas = null;
      this.context = null;
      this.renderer = null;

      this.sceneRoot.dispose();
      this.sceneRoot = null;

      this.$window = null;
      this.$body = null;

      this.redrawRectangles = null;
      this.translations = null;
      this.rotations = null;
      this.translationOrigin = null;
    },
    // Adapted from http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    handleClick: function(event) {
      var x;
      var y;

      event.preventDefault();

      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= this.canvas.parentNode.offsetLeft;
      y -= this.canvas.parentNode.offsetTop;
      this.clickX = x;
      this.clickY = y;
    },
    clicked: function(entity) {
      var width;
      var height;
      var x;
      var y;
      var iter;

      if (!entity instanceof Graphic || this.clickX < 0 || this.clickY < 0) {
        return false;
      }

      iter = entity;
      width = entity.width * this.graphicRatio;
      height = entity.height * this.graphicRatio;
      x = 0;
      y = 0;

      do {
        if (iter instanceof Entity) {
          x += iter.position.x * this.graphicRatio * this.tileSize;
          y += iter.position.y * this.graphicRatio * this.tileSize;
        }
      } while (iter = iter.parent);

      return this.clickX >= x && this.clickY >= y &&
          this.clickX <= (x + width) &&
          this.clickY <= (y + height);
    },
    draw: function(entity) {
      if (entity && entity instanceof Entity) {
        var x = entity.position.x * this.graphicRatio * this.tileSize;
        var y = entity.position.y * this.graphicRatio * this.tileSize;
        var w = entity.width * this.graphicRatio;
        var h = entity.height * this.graphicRatio;
        var w2 = w / 2;
        var h2 = h / 2;
        var r = entity.rotation;
        var drawRect = new Rectangle(-w2, -h2, -w2 + w, -h2 + h);

        this.pushTranslation(new Vector2(w2, h2));
        r && this.pushRotation(r);

        if (entity instanceof Graphic && this.shouldRedraw(drawRect, entity)) {
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
        }

        r && this.popRotation();
        this.popTranslation();

        return r;
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

          if (iter instanceof Entity) {
            x = iter.position.x * this.graphicRatio * this.tileSize;
            y = iter.position.y * this.graphicRatio * this.tileSize;
          }

          this.pushTranslation(new Vector2(x, y));

          this.draw(iter);
          this.drawScene(iter.firstChild);

          this.popTranslation();

        } while (iter = iter.nextSibling);
      }
    },
    updateScene: function(node) {
      if (node) {
        var iter = node;

        do {
          if (iter instanceof Graphic) {
            if (this.clicked(iter)) {
              iter.trigger('click', iter);
            }
            iter.draw();
          }

          this.updateScene(iter.firstChild);
        } while(iter = iter.nextSibling);
      }
    },
    render: function() {
      this.updateScene(this.sceneRoot);
      this.drawScene(this.sceneRoot);
      this.cleanup();
    },
    renderDebugInfo: function() {
      var iter = this.redrawRectangles;

      while (iter) {
        iter.alpha = 0.2;
        iter = iter.next;
      }

      if (this.oldRedrawRectangles) {
        iter = this.oldRedrawRectangles;
        while (iter) {
          if (!iter.next) {
            iter.next = this.redrawRectangles;
            break;
          }
          iter = iter.next;
        }
      } else {
        this.oldRedrawRectangles = this.redrawRectangles;
      }

      iter = this.oldRedrawRectangles;

      while (iter) {
        this.context.fillStyle = 'rgba(255, 0, 0, ' + iter.alpha + ')';
        this.context.fillRect(iter.getX(), iter.getY(), iter.getWidth(), iter.getHeight());

        iter.alpha -= 0.005;

        while (iter.next && iter.next.alpha <= 0) {
          iter.next = iter.next.next;
        }

        iter = iter.next;
      }
    },
    cleanup: function() {
      //this.debug = true;

      if (this.debug) {
        this.renderDebugInfo();
        this.rendered = false;
      } else {
        this.rendered = true;
      }

      this.redrawRectangles = null;
      this.clickX = -1;
      this.clickY = -1;
    },
    pushTranslation: function(translation) {
      if (translation) {
        this.context.save();
        this.context.translate(translation.x, translation.y);
        this.translationOrigin.add(translation);
        this.translations.push(translation);
      }
    },
    popTranslation: function() {
      var translation = this.translations.pop();
      this.translationOrigin.subtract(translation);
      this.context.restore();
      return translation;
    },
    pushRotation: function(rotation) {
      if (rotation) {
        this.context.save();
        this.context.rotate(rotation);
        this.rotationOrigin += rotation;
        this.rotations.push(rotation);
      }
    },
    popRotation: function() {
      var rotation = this.rotations.pop();
      this.rotationOrigin -= rotation;
      this.context.restore();
      return rotation;
    },
    pushRedrawRectangle: function(rect) {
      if (rect) {
        var iter = rect;
        var top = rect.top * this.graphicRatio * this.tileSize;
        var left = rect.left * this.graphicRatio * this.tileSize;
        var right = left + this.graphicRatio * rect.getWidth();
        var bottom = top + this.graphicRatio * rect.getHeight();

        rect.set(left, top, right, bottom);

        rect.next = this.redrawRectangles;

        while (iter.next) {
          if (iter.next.intersects(rect)) {
            rect.add(iter.next);
            iter.next = iter.next.next;
          } else {
            iter = iter.next;
          }
        }

        this.redrawRectangles = rect;
      }
    },
    setRevealedLocation: function(name, circle) {
      this.revealedLocations[name] = circle;
    },
    adjusted: function(rect) {
      var adjusted = new Rectangle();
      adjusted.set(rect.left + this.translationOrigin.x,
               rect.top + this.translationOrigin.y,
               rect.right + this.translationOrigin.x,
               rect.bottom + this.translationOrigin.y);
      return adjusted;
    },
    shouldRedraw: function(rect, entity) {
      var iter;
      var center;
      var name;
      var circle;
      var reveal;

      if (entity.visible === false) {
        return false;
      }

      if (!this.rendered && entity.alwaysVisible === true) {
        return true;
      }

      rect = this.adjusted(rect);

      /*if (entity.alwaysVisible === false) {
        center = new Vector2(rect.getX(), rect.getY());
        center.divide(this.tileSize * this.graphicRatio);

        reveal = false;

        for (name in this.revealedLocations) {
          circle = this.revealedLocations[name];
          if (center.distanceTo(circle.position) < circle.radius) {
            reveal = true;
            break;
          }
        }

        if (!reveal) {
          return false;
        }
      }*/

      if (!this.redrawRectangles) {
        return false;
      }
     
      iter = this.redrawRectangles;
      
      do {
        if (rect.intersects(iter)) {
          return true;
        }
      } while (iter = iter.next);

      return false;
    },
    invalidateRatios: function() {
      this.pixelRatio = window.pixelRatio || 1;
      this.graphicRatio = 2;
      this.tileSize = 20;

      if (window.matchMedia) {
        if (this.matchTinyScreen.matches) {
          this.graphicRatio = 1;
        }
        if (this.matchSmallScreen.matches) {
          this.graphicRatio = 1.5;
        }
        if (this.matchMediumScreen.matches) {
          this.graphicRatio = 2;
        }
        if (this.matchLargeScreen.matches) {
          this.graphicRatio = 3;
        }
      }

      this.width = this.options.width * (this.pixelRatio / 2) * this.graphicRatio;
      this.height = this.options.height * (this.pixelRatio / 2) * this.graphicRatio;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.width = this.width / this.pixelRatio + 'px';
      this.canvas.style.height = this.height / this.pixelRatio + 'px';

      this.context.scale(this.pixelRatio, this.pixelRatio);
      this.rendered = false;
    }
  });

  _.extend(Renderer.prototype, Backbone.Events);

  return Renderer;
});
