define('game/interface',
       ['underscore', 'q', 'game/world', 'game/object', 'game/node', 'model/game/turn', 'model/game/outcome'],
       function(_, q, World, GameObject, Node, TurnModel, Outcome) {
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
      this.model = options.model;

      this.world.heroAlpha.on('click', this.selectHero, this);
      this.world.heroBeta.on('click', this.selectHero, this);
      this.world.heroAlpha.model.on('change:points', this.updateTurn, this);
      this.world.heroBeta.model.on('change:points', this.updateTurn, this);
      this.world.on('click:highlight', this.selectWaypointPosition, this);
      this.ui.on('click:mode', this.toggleMode, this);
      this.ui.on('click:endTurn', this.submitTurn, this);

      this.enableInteraction();
    },
    submitTurn: function() {
      var heroAlpha = this.world.heroAlpha;
      var heroBeta = this.world.heroBeta;

      this.clearSelection();

      this.model.set('turn', this.turn);
      this.disableInteraction();
    },
    performOutcomes: function(outcomeList) {

      var subAOutcomes = outcomeList[0];
      var subBOutcomes = outcomeList[1];
      var rktAOutcomes = outcomeList[2];
      var rktBOutcomes = outcomeList[3];
      var stepCount = subAOutcomes.length;
      var outcomesResolve = q.resolve();
      var queueStep = _.bind(function(step) {
        outcomesResolve = outcomesResolve.then(_.bind(function() {
          return this.performOutcomeStepForEach([subAOutcomes.at(step),
                                                 subBOutcomes.at(step),
                                                 rktAOutcomes.at(step),
                                                 rktBOutcomes.at(step)]);
        }, this));
      }, this);
      var index;

      if (subAOutcomes.length !== stepCount || subBOutcomes.length !== stepCount || rktAOutcomes.length !== stepCount || rktBOutcomes.length !== stepCount)
        debugger;

      for (index = 0; index < stepCount; index++) {
        queueStep(index);
      }

      return outcomesResolve.then(_.bind(function() {
        this.ui.hideMessage();
        this.enableInteraction();
      }, this));
    },
    performOutcomeStepForEach: function(steps) {
      var resolutions = [];

      _.each(steps, function(step) {
        var unit = this.world[step.get('unit')];
        var stepType = step.get('type');

        if (stepType === Outcome.type.MOVE || stepType === Outcome.type.MOVE_SHIELDED) {
          resolutions.push(unit.walkPath(step.get('points')));
        } else if (stepType === Outcome.type.ATTACK) {
          resolutions.push(unit.fireLaser(step.get('points')[0]));
        }

        if (stepType === Outcome.type.ATTACK) {
          console.log(unit, 'attacks', step.get('points')[0]);
        }
      }, this);

      return q.all(resolutions);
    },
    dispose: function() {
      this.world = null;
      this.scene = null;
    },
    enableInteraction: function() {
      this.interactive = true;
      if (this.turn) {
        this.turn.off(null, null, this);
      }
      this.turn = new TurnModel({
        team: 'sub'
      });
      this.turn.on('change', this.resetEndTurn, this);
      this.world.heroAlpha.reveal();
      this.world.heroBeta.reveal();
    },
    disableInteraction: function() {
      this.interactive = false;
      this.world.heroAlpha.model.set('points', []);
      this.world.heroBeta.model.set('points', []);
      this.clearSelection();
    },
    updateTurn: function() {
      if (this.world.heroAlpha.model.get('points').length) {
        this.turn.set('moveA', this.world.heroAlpha.getCurrentMove());
      } else {
        this.turn.set('moveA', null);
      }

      if (this.world.heroBeta.model.get('points').length) {
        this.turn.set('moveB', this.world.heroBeta.getCurrentMove());
      } else {
        this.turn.set('moveB', null);
      }
    },
    resetEndTurn: function() {
      if (this.turn.get('moveA') && this.turn.get('moveB')) {
        this.ui.enableEndTurn();
      } else {
        this.ui.disableEndTurn();
      }
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
      this.world.highlight(hero.position, hero.model.get('shielded') ? 2 : 4, hero.color);
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
