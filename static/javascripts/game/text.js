if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['jquery'],
       function($) {
  $.fn.gameText = function() {
    this.filter('.game-text').each(function(index, element) {
      var $el = $(element);
      var text = $.trim($el.text());
      var index;
      var letter;

      $el.text('');

      for (index = 0; index < text.length; index++) {
        letter = $('<span>' + text.charAt(index) + '</span>');
        letter.css('backgroundPosition', ((text.toUpperCase().charCodeAt(index) - 32) * 100 / 76 + '% 0px'));
        $el.append(letter);
      }
    });
  };
});
