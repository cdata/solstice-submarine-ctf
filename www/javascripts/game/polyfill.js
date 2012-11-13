define('game/polyfill', ['underscore'], function(_) {

  // Adapted from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           window.oRequestAnimationFrame || 
           window.msRequestAnimationFrame || 
           function(callback) {
             window.setTimeout(callback, 1000 / 60);
           };
  })();

  window.pixelRatio = (function() {
    var ratio = window.devicePixelRatio;
    if (!ratio) {
      if(window.matchMedia && 
         (window.matchMedia('min--moz-device-pixel-ratio: 2').matches ||
          window.matchMedia('-webkit-min-device-pixel-ratio: 2').matches ||
          window.matchMedia('-o-min-device-pixel-ratio: 2/1').matches ||
          window.matchMedia('min-resolution: 2dppx'))) {
        ratio = 2;
      } else {
        ratio = 1;
      }
    }
    return ratio;
  })();
});
