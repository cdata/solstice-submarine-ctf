define('game/text',
       ['jquery'],
       function($) {
  $.fn.gameText = function() {
    this.filter('.game-text').each(function(index, element) {
      var $el = $(element);
      var text = $el.text().toUpperCase();
      var index;
      var letter;

      $el.text('');

      for (index = 0; index < text.length; index++) {
        letter = $('<span>' + text.charAt(index) + '</span>');
        letter.css('backgroundPositionX', (text.charCodeAt(index) - 32) * -16 + 'px');
        $el.append(letter);
      }
    });
  };
});
