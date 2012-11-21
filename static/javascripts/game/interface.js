define('game/interface',
       ['underscore', 'game/world', 'game/object', 'game/node'],
       function(_, World, GameObject, Node) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        worldUrl: 'assets/data/maps/seabound.json',
        scene: new Node()
      });

      this.scene = options.scene;
      this.world = this.scene.append(new World({
        url: options.worldUrl
      }));
      this.selected = [];

      this.world.heroAlpha.on('click', this.selectHero, this);
      this.world.heroBeta.on('click', this.selectHero, this);
      this.world.on('click:highlight', this.selectWaypointPosition, this);

      this.disableInteraction();
    },
    dispose: function() {
      this.world.dispose();
      this.world = null;
      this.scene = null;
    },
    enableInteraction: function() {
      this.interactive = true;
    },
    disableInteraction: function() {
      this.interactive = false;
      this.clearSelection();
    },
    selectHero: function(hero) {
      if (!this.interactive) {
        return;
      }

      this.select(hero);
      this.world.highlight(hero.position, 4);
    },
    selectWaypointPosition: function(position) {
      /*var hero = this.selected[0];
      var path = this.world.getPath(hero.position, position);

      hero.walkPath(path);
      this.clearSelection();*/
    },
    clearSelection: function() {
      var selected;
      while (this.selected.length) {
        selected = this.selected.pop()
        if (selected.blur) {
          selected.blur();
        }
      }
      this.world.clearHighlight();
    },
    select: function(entity) {
      this.clearSelection();
      this.selected.push(entity);
      if (entity.focus) {
        entity.focus();
      }
    }
  });
});
