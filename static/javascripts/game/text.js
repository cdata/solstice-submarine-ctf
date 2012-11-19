define('game/text',
       ['jquery'],
       function($) {
  $.fn.gameText = function() {
    this.filter('.game-text').each(function(index, element) {
      var $el = $(element);
      var text = $el.text();
      var index;
      var letter;

      $el.text('');

      for (index = 0; index < text.length; index++) {
        letter = $('<span>' + text.charAt(index) + '</span>');
        letter.css('backgroundPosition', (text.toUpperCase().charCodeAt(index) - 32) * -100 + '% 0');
        $el.append(letter);
      }
    });
  };
});
