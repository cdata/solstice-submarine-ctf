define('model/user',
       ['backbone', 'underscore', 'jquery', 'persona'],
       function(Backbone, _, $) {
  return Backbone.Model.extend({
    defaults: {
      id: null
    },
    initialize: function() {
      navigator.id.watch({
        loggedInUser: this.get('id'),
        onlogin: _.bind(this.login, this),
        onlogout: _.bind(this.logout, this)
      });
    },
    login: function(assertion) {
      $.ajax({
        url: 'persona/verify',
        type: 'POST',
        data: {
          assertion: assertion
        },
        success: _.bind(function(res) {
          var data = res;
          this.set('id', data.email);
        }, this)
      });
    },
    logout: function() {
      $.ajax({
        url: 'persona/logout',
        type: 'POST',
        success: _.bind(function() {
          this.set('id', null);
        }, this)
      });
    },
    isLoggedIn: function() {
      return this.get('id') !== null;
    }
  });
});
