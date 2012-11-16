define('game/brain',
       ['underscore', 'game/world', 'game/object', 'game/node'],
       function(_, World, GameObject, Node) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        worldUrl: '/assets/data/maps/seabound.json',
        scene: new Node()
      });

      this.scene = options.scene;
      this.world = this.scene.append(new World({
        url: options.worldUrl
      }));
      this.selected = [];

      this.world.heroAlpha.on('click', this.onClickHero, this);
      this.world.heroBeta.on('click', this.onClickHero, this);

      this.enableInteraction();
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
    },
    onClickHero: function(sub) {
      this.clearSelection();
      this.select(sub);
      this.world.clearHighlight();
      this.world.highlight(sub.position, 4);
    },
    clearSelection: function() {
      var selected;
      while (this.selected.length) {
        selected = this.selected.pop()
        if (selected.blur) {
          selected.blur();
        }
      }
    },
    select: function(entity) {
      this.selected.push(entity);
      if (entity.focus) {
        entity.focus();
      }
    }
  });
});
