define('view/loader', 
       ['backbone', 'handlebars/templates', 'game/loader'],
       function(Backbone, templates, Loader) {
  return Backbone.View.extend({
    initialize: function() {
      this.loader = new Loader();

      this.loader.on('loading', this.onLoadingItem, this);
      this.loader.on('done', this.onLoadDone, this);
    },
    dispose: function() {
      this.loader.off();
      this.loader.dispose();

      this.loader = null;
      this.$files = null;
      this.$percent = null;
      this.$bar = null;
    },
    render: function() {
      this.setElement(templates.loader());
      this.$files = this.$('.files .value');
      this.$percent = this.$('.percent .value');
      this.$bar = this.$('.progress .bar');
      return this;
    },
    load: function() {
      this.loader.load(this.model.toFlatList());
    },
    onLoadingItem: function() {
      var total = this.model.getTotal();
      var remainingItems = this.loader.remainingItems;
      var ratio = Math.round((total - remainingItems) / total * 100);

      this.$files.text(remainingItems);
      this.$percent.text(ratio);
      this.$bar.css({ width: ratio + '%' });
    }
  });
});
