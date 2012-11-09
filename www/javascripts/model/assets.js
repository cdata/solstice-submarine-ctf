define('model/assets',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      images: [],
      data: []
    },
    getTotal: function() {
      return this.get('images').length + this.get('data').length
    },
    toFlatList: function() {
      return this.get('images').concat(this.get('data'));
    }
  });
});
