define('view/start',
       ['underscore', 'backbone', 'handlebars/templates', 'game/text'],
       function(_, Backbone, templates) {
  return Backbone.View.extend({
    render: function() {
      this.setElement(templates.start());
      this.$('.game-text').gameText();
      return this;
    },
    dispose: function() {}
  });
});

