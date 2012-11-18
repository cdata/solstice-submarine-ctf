define('app',
       ['backbone', 'jquery', 'underscore', 'view/start', 'view/choosemode', 'view/game', 'view/loader', 'model/assets', 'model/application', 'model/user', 'game/assets'],
       function(Backbone, $, _, StartView, ChooseModeView, GameView, LoaderView, AssetsModel, ApplicationModel, UserModel, assets) {
  var App = Backbone.Router.extend({
    routes: {
      '': 'index',
      'load': 'loadAssets',
      'play': 'launchGame',
      'choose-mode': 'chooseMode',
      'start': 'start'
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
          '/assets/images/font.png',
          '/assets/images/highlight.png',
          '/assets/images/logo.png',
          '/assets/images/test.png'
        ]
      });

      this.user = new UserModel();
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
        this.navigate('start', { trigger: true });
      }
    },
    start: function() {
      if (this.verifyLoaded()) {
        this.setCurrentView(new StartView());
      }
    },
    chooseMode: function() {
      if (this.verifyLoaded()) {
        this.setCurrentView(new ChooseModeView());
      }
    },
    launchGame: function() {
      if (this.verifyLoaded()) {
        try {
          var game = this.setCurrentView(new GameView());
          game.play();
        } catch(e) {
          console.error(e.stack || e.message || e.toString());
        }
      }
    },
    removeCurrentView: function() {
      if (this.currentView) {
        this.$body.removeClass(function(index, className) {
          return className.match(/(route-(?:[^ ]*))/gi).join(' ');
        });
        this.currentView.$el.remove();
        this.currentView.off();
        this.currentView.dispose();
        delete this.currentView;
      }
    },
    setCurrentView: function(view) {
      if (this.currentView !== view) {
        this.removeCurrentView();
        this.$body.addClass('route-' + Backbone.history.fragment);
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
      this.navigate('start', { trigger: true });
    },
    verifyLoaded: function() {
      if (!this.model.get('assetsLoaded')) {
        this.navigate('load', { trigger: true });
      }
      return this.model.get('assetsLoaded');
    }
  });

  return App;
});
