if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'jquery', 'game/object'],
       function(_, $, GameObject) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults({
        url: 'assets/music/bubbles'
      });

      this.audio = document.createElement('audio');
      this.audio.controls = false;
      this.audio.autoplay = false;
      this.audio.preload = 'auto';
      this.audio.autobuffer = true;
      if ('loop' in this.audio) {
        this.audio.loop = true;
      } else {
        try {
          this.audio.addEventListener('ended', this.restart, this);
        } catch(e) {}
      }
      this.$audio = $(this.audio);
      this.$mp3Src = $(document.createElement('source'));
      this.$mp3Src.attr('src', options.url + '.mp3');
      this.$oggSrc = $(document.createElement('source'));
      this.$oggSrc.attr('src', options.url + '.ogg');

      this.$audio.append(this.$mp3Src);
      this.$audio.append(this.$oggSrc);

      $(document.body).append(this.$audio);
    },
    restart: function() {
      this.stop();
      this.play();
    },
    play: function() {
      try {
        this.audio.play();
      } catch(e) {}
    },
    stop: function() {
      this.audio.currentTime = 0;
    },
    pause: function() {
      try {
        this.audio.pause();
      } catch(e) {}
    },
    dispose: function() {
      this.pause();
      this.$audio.remove();
      this.$audio = null;
      this.$mp4Src = null;
      this.$oggSrc = null;
      this.audio = null;
    }
  });
});
