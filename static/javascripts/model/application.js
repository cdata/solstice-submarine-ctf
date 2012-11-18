define('model/application',
       ['backbone'],
       function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      assetsLoaded: false
    }
  });
});
