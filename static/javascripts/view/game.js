define('view/game',
       ['backbone', 'handlebars/templates', 'game', 'view/game/ui'],
       function(Backbone, templates, Game, UIView) {
  return Backbone.View.extend({
    initialize: function(options) {
      this.ui = new UIView();
      this.game = new Game({
        ui: this.ui
      });
      this.app = options.app;
    },
    delegateEvents: function() {
      this.ui.on('click:exit', this.exit, this);
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
    },
    undelegateEvents: function() {
      this.ui.off(null, null, this);
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
    },
    dispose: function() {
      this.game.dispose();
      this.game = null;

      this.ui.dispose();
      this.ui = null;
    },
    render: function() {
      this.setElement(templates.game());
      this.$el.append(this.ui.render().$el);
      return this;
    },
    play: function() {
      this.game.start();
    },
    exit: function() {
      // TODO: Prompt "are you sure?"
      this.app.navigate('start', { trigger: true });
    }
  });
});

