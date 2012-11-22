define('game/graphic/animated',
       ['underscore', 'game/graphic', 'game/vector2', 'game/clock'],
       function(_, Graphic, Vector2, Clock) {
  return Graphic.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        frameInterval: 8
      });
      Graphic.prototype.initialize.call(this, options);
      this.clock = new Clock();
      this.frameInterval = options.frameInterval;
      this.frameTime = 0;
      this.frame = 0;
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
      var frameLength = frames.y - frames.x + 1;
      var framesPassed;

      this.frameTime += this.clock.getDelta() * 1000;

      if (this.frameTime > this.frameInterval) {

        framesPassed = Math.floor(this.frameTime / this.frameInterval);

        this.frame = (this.frame + framesPassed) % frameLength;
        this.frameTime = this.frameTime % this.frameInterval;

        this.sprite.goTo(frames.x + this.frame);
        this.redraw();
      }
    },
    useFrameAnimation: function(id, frameInterval) {
      this.currentAnimation = id in this.animations ? id : this.currentAnimation;
      this.frameInterval = frameInterval || this.frameInterval;
      this.frame = 0;

      this.sprite.goTo(this.animations[this.currentAnimation].x);
      this.redraw();
    },
    defineFrameAnimation: function(id, startFrame, endFrame) {
      this.animations[id] = new Vector2(startFrame, endFrame);
    }
  });
});

//@ sourceURL=/javascripts/game/graphic/animated.js
