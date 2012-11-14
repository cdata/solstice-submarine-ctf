define('game/graphic/animated',
       ['three', 'underscore', 'game/graphic'],
       function(THREE, _, Graphic) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        frameInterval: 8
      });
      Graphic.prototype.initialize.call(this, options);
      this.clock = new THREE.Clock();
      this.frameInterval = options.frameInterval;
      this.frameTime = 0;
      this.frame = 0;
      this.animations = {
        default: new THREE.Vector2(0, 24)
      };
      this.currentAnimation = 'default';
    },
    dispose: function() {
      Graphic.prototype.dispose.apply(this, arguments);
      this.animations = null;
      this.clock = null;
    },
    draw: function() {
      this.updateFrameAnimation();
    },
    updateFrameAnimation: function() {
      var frames = this.animations[this.currentAnimation];
      var maxFrame = frames.y - frames.x;
      var drawRect;

      this.frameTime += this.clock.getDelta() * 1000;

      if (this.frameTime > this.frameInterval) {

        if (this.frame < maxFrame) {
          ++this.frame;
        } else {
          this.frame = 0;
        }

        drawRect = new THREE.Rectangle();
        drawRect.set(this.position.x, 
                     this.position.y,
                     this.position.x + this.width,
                     this.position.y + this.height);

        this.sprite.goTo(frames.x + this.frame);
        this.trigger('draw', drawRect);

        this.frameTime = 0;
      }
    },
    useFrameAnimation: function(id, frameInterval) {
      this.currentAnimation = id in this.animations ? id : this.currentAnimation;
      this.frameInterval = frameInterval || this.frameInterval;
      this.frame = 0;

      this.sprite.goTo(this.animations[this.currentAnimation].x);
    },
    defineFrameAnimation: function(id, startFrame, endFrame) {
      this.animations[id] = new THREE.Vector2(startFrame, endFrame);
    }
  });
});

//@ sourceURL=/javascripts/game/graphic/animated.js
