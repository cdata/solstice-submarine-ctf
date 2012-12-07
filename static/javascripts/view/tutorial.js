define(['underscore', 'backbone', 'handlebars/templates'],
       function(_, Backbone, templates) {
  return Backbone.View.extend({
    events: {
      'click .next': 'nextPage',
      'click .exit': 'exit'
    },
    initialize: function(options) {
      this.page = 0;
      this.app = options.app;
    },
    render: function() {
      this.setElement(templates.tutorial());
      this.$('.game-text').gameText();
      this.$pages = this.$('ol');
      return this;
    },
    dispose: function() {},
    nextPage: function() {
      ++this.page;
      if (this.page < 9) {
        this.$pages.css({
          left: this.page * -100 + '%'
        });
      } else {
        this.exit();
      }
    },
    exit: function() {
      this.app.navigate('start', { trigger: true });
    }
  });
});
