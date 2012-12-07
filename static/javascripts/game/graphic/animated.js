if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/graphic', 'game/vector2', 'game/clock'],
       function(_, Graphic, Vector2, Clock) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        frameInterval: 8
      });
      Graphic.prototype.initialize.call(this, options);
      this.clock = new Clock();
      this.defaultFrameInterval = options.frameInterval;
      this.frameInterval = this.defaultFrameInterval;
      this.frameTime = 0;
      this.frame = 0;
      this.framesPassed = 0;
      this.animationCallback = null;
      this.animations = {
        default: new Vector2(0, 24)
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
      var frameLength = Math.abs(frames.y - frames.x) + 1;
      var lastFrame = this.frame;
      var framesPassed;
      var frameDirection;

      this.frameTime += this.clock.getDelta() * 1000;

      if (this.frameTime > this.frameInterval) {

        frameDirection = frames.y >= frames.x ? 1 : -1

        framesPassed = Math.floor(this.frameTime / this.frameInterval);

        this.frame = (this.frame + framesPassed) % frameLength;
        this.framesPassed += framesPassed;
        this.frameTime = this.frameTime % this.frameInterval;

        if (this.framesPassed >= frameLength && this.animationCallback) {
          this.animationCallback();
          this.animationCallback = null;
        } else {
          this.sprite.goTo(frames.x + frameDirection * this.frame);
          this.redraw();
        }
      }
    },
    useFrameAnimation: function(id, frameInterval, callback) {
      this.currentAnimation = id in this.animations ? id : this.currentAnimation;
      this.frameInterval = frameInterval || this.defaultFrameInterval;
      this.frame = 0;
      this.framesPassed = 0;

      this.animationCallback = callback || null;

      this.sprite.goTo(this.animations[this.currentAnimation].x);
      this.redraw();
    },
    defineFrameAnimation: function(id, startFrame, endFrame) {
      this.animations[id] = new Vector2(startFrame, endFrame);
    }
  });
});

//@ sourceURL=/javascripts/game/graphic/animated.js
