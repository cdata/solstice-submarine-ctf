define('view/start',
       ['underscore', 'backbone', 'handlebars/templates'],
       function(_, Backbone, templates) {
  return Backbone.View.extend({
    render: function() {
      this.setElement(templates.start());
      return this;
    },
    dispose: function() {}
  });
});

