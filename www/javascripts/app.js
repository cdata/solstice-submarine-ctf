define('app',
       ['backbone', 'jquery', 'underscore', 'view/game', 'view/loader', 'model/assets', 'model/application', 'game/assets'],
       function(Backbone, $, _, GameView, LoaderView, AssetsModel, ApplicationModel, assets) {
  var App = Backbone.Router.extend({
    routes: {
      '': 'index',
      'load': 'loadAssets',
      'play': 'launchGame'
    },
    initialize: function() {
      this.assetSources = new AssetsModel({
        data: [
          '/assets/data/maps/seabound.json'
        ],
        images: [
          '/assets/images/floor.png',
          '/assets/images/items.png',
          '/assets/images/walls.png',
          '/assets/images/teal-sub.png',
          '/assets/images/yellow-sub.png',
          '/assets/images/red-rocket.png',
          '/assets/images/blue-rocket.png',
          '/assets/images/test.png'
        ]
      });
      this.model = new ApplicationModel();
      this.$body = $('body');

      Backbone.history.start();
    },
    index: function() {
      this.navigate('load', { trigger: true });
    },
    loadAssets: function() {
      if (!this.model.get('assetsLoaded')) {
        var loaderView = this.setCurrentView(new LoaderView({ model: this.assetSources }));
        loaderView.loader.on('loaded', this.onLoadAsset, this);
        loaderView.loader.on('done', this.onLoadComplete, this);
        loaderView.load();
      } else {
        this.navigate('play', { trigger: true });
      }
    },
    launchGame: function() {
      try {
        if (this.model.get('assetsLoaded')) {
          var game = this.setCurrentView(new GameView());
          game.play();
        } else {
          this.navigate('load', { trigger: true });
        }
      } catch(e) {
        console.error(e.stack || e.message || e.toString());
      }
    },
    removeCurrentView: function() {
      if (this.currentView) {
        this.currentView.$el.remove();
        this.currentView.off();
        this.currentView.dispose();
        delete this.currentView;
      }
    },
    setCurrentView: function(view) {
      if (this.currentView !== view) {
        this.removeCurrentView();
        this.$body.prepend(view.render().$el);
        this.currentView = view;
      }
      return view;
    },
    onLoadAsset: function(asset) {
      assets.registerAsset(asset.url, asset.data);
    },
    onLoadComplete: function() {
      this.model.set('assetsLoaded', true);
      this.navigate('play', { trigger: true });
    }
  });

  return App;
});
