define('view/choosemode',
       ['backbone', 'handlebars/templates', 'jquery', 'game/text'],
       function(Backbone, templates, $) {
  return Backbone.View.extend({
    tagName: 'section',
    id: 'Choose-Mode',
    initialize: function() {
      this.model.on('change:id', this.render, this);
    },
    render: function() {
      this.$el.html(templates.choosemode(this.model.toJSON()));
      this.$('.game-text').gameText();
      return this;
    },
    dispose: function() {
      this.model.off('change:id', this.render, this);  
    }
  });
});
