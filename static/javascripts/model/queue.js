define(['underscore', 'backbone'],
       function(_, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      length: null
    },
    url: '/check-queue',
    initialize: function() {
      this.interval = window.setInterval(_.bind(this.fetch, this), 10000);
      this.fetch();
    },
    parse: function(data) {
      data.length = data.length || null;
      return data;
    }
  });
});
