define('game/interface',
       ['underscore', 'game/world', 'game/object', 'game/node'],
       function(_, World, GameObject, Node) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        worldUrl: 'assets/data/maps/seabound.json',
        scene: new Node()
      });

      this.ui = options.ui;
      this.scene = options.scene;
      this.world = this.scene.append(new World({
        url: options.worldUrl
      }));
      this.selected = [];

      this.world.heroAlpha.on('click', this.selectHero, this);
      this.world.heroBeta.on('click', this.selectHero, this);
      this.world.on('click:highlight', this.selectWaypointPosition, this);
      this.ui.on('click:mode', this.toggleMode, this);
      this.ui.on('click:endTurn', this.endTurn, this);

      this.ui.enableEndTurn();

      //this.disableInteraction();
      this.enableInteraction();
    },
    endTurn: function() {
      var heroAlpha = this.world.heroAlpha;
      var heroBeta = this.world.heroBeta;

      this.clearSelection();

      heroAlpha.walkPath(heroAlpha.model.get('points'));
      heroBeta.walkPath(heroBeta.model.get('points'));

      heroAlpha.model.set('points', []);
      heroBeta.model.set('points', []);
    },
    dispose: function() {
      this.world.dispose();
      this.world = null;
      this.scene = null;
    },
    enableInteraction: function() {
      this.interactive = true;
      this.world.heroAlpha.reveal();
      this.world.heroBeta.reveal();
    },
    disableInteraction: function() {
      this.interactive = false;
      this.clearSelection();
    },
    toggleMode: function() {
      var hero = this.selected[0];
      var toggled = this.ui.model.get('modeToggled');
      var points = hero.model.get('points');

      if (points.length > 2 && toggled) {
        hero.model.set('points', points.slice(0, 2));
      }

      hero.model.set('shielded', toggled);
      this.highlightPaths(hero);
    },
    selectHero: function(hero) {
      if (!this.interactive) {
        return;
      }

      if (this.selected[0] === hero) {
        hero.model.set('points', []);
        return;
      } else {
        this.select(hero);
        this.highlightPaths(hero);
      }
    },
    highlightPaths: function(hero) {
      this.world.highlight(hero.position, hero.model.get('shielded') ? 2 : 4);
    },
    selectWaypointPosition: function(position) {
      var hero = this.selected[0];
      var companion = this.world.companionOf(hero);
      var companionWaypoints = companion.model.get('points');

      if (!position.equals(companionWaypoints[companionWaypoints.length - 1])) {
        hero.model.set('points', this.world.getPath(hero.position, position));
        this.clearSelection();
      }
    },
    clearSelection: function() {
      var selected;
      while (this.selected.length) {
        selected = this.selected.pop()
        if (selected.blur) {
          selected.blur();
        }
      }
      this.ui.disableMode();
      this.world.clearHighlight();
    },
    select: function(entity) {
      this.clearSelection();
      this.ui.enableMode();
      this.ui.model.set('modeToggled', entity.model.get('shielded'));
      this.selected.push(entity);
      if (entity.focus) {
        entity.focus();
      }
    }
  });
});
