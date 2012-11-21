define('view/choosemode',
       ['backbone', 'handlebars/templates', 'jquery', 'game/text'],
       function(Backbone, templates, $) {
  return Backbone.View.extend({
    tagName: 'section',
    id: 'Choose-Mode',
    events: {
      'click a[href="#login"]': 'login'
    },
    initialize: function(options) {
      this.model.on('change:id', this.render, this);
      this.app = options && options.app;
    },
    render: function() {
      this.$el.html(templates.choosemode(this.model.toJSON()));
      this.$('.game-text').gameText();
      return this;
    },
    dispose: function() {
      this.model.off('change:id', this.render, this);  
    },
    login: function() {
      // Persona uses a popup. Gotta launch it
      // in a short-lived event handler..
      this.app.navigate('login');
      this.app.login();
    }
  });
});
