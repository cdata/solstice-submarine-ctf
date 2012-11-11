define('view/game',
       ['backbone', 'handlebars/templates', 'game'],
       function(Backbone, templates, Game) {
  return Backbone.View.extend({
    initialize: function() {
      this.game = new Game();
    },
    dispose: function() {
      this.game.dispose();
      this.game = null;
    },
    render: function() {
      this.setElement(templates.game());
      return this;
    },
    play: function() {
      this.game.start();
    }
  });
});

