define('model/application',
       ['backbone'],
       function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      assetsLoaded: false
    },
    initialize: function() {
      this.set('assetsLoaded', (function() {
        // TODO: Revisit asset loading..
        /*try {
          return !!localStorage.getItem('assetsLoaded');
        } catch(e) {}*/
        return false;
      })());

      this.on('change:assetsLoaded', this.updateStorage, this);
    },
    updateStorage: function() {
      if (this.get('assetsLoaded')) {
        try {
          localStorage.setItem('assetsLoaded', '1');
        } catch(e) {}
      }
    }
  });
});
