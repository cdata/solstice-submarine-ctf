define(['backbone', 'underscore', 'jquery', 'model/queue', 'persona'],
       function(Backbone, _, $, QueueModel) {
  return Backbone.Model.extend({
    defaults: function() {
      return {
        id: null,
        queue: new QueueModel()
      };
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
    },
    toJSON: function() {
      var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
      return _.extend(data, {
        queue: this.get('queue').toJSON()
      });
    }
  });
});
