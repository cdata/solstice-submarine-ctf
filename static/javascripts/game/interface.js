if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'q', 'game/world', 'game/object', 'game/node', 'model/game/turn', 'model/game/outcome', 'game/vector2'],
       function(_, q, World, GameObject, Node, TurnModel, Outcome, Vector2) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        worldUrl: 'assets/data/maps/seabound.json',
        scene: new Node()
      });
      this.model = options.model;
      this.subFork = this.model.get('forks')[0];
      this.rktFork = this.model.get('forks')[1];

      this.ui = options.ui;
      this.scene = options.scene;
      this.world = this.scene.append(new World({
        url: options.worldUrl,
        subFork: this.subFork,
        rktFork: this.rktFork
      }));
      this.selected = [];

      this.ui.on('click:mode', this.toggleMode, this);
      this.ui.on('click:endTurn', this.submitTurn, this);
      this.model.on('change:team', this.selectTeam, this);

      this.disableInteraction();
    },
    selectTeam: function() {
      this.world.setTeam(this.model.get('team'));
      this.world.heroAlpha.on('click', this.selectHero, this);
      this.world.heroBeta.on('click', this.selectHero, this);
      this.world.heroAlpha.model.on('change:points', this.updateTurn, this);
      this.world.heroBeta.model.on('change:points', this.updateTurn, this);
      this.world.on('click:highlight', this.selectWaypointPosition, this);

      this.ui.hideMessage();
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
        var rktScore = this.model.get('rktScore');
        var subScore = this.model.get('subScore');
        var subWin = false;
        var rktWin = false;
        var tie = false;

        this.ui.setScore(subScore, rktScore);

        if (subScore >= 100 && rktScore >= 100) {
          if (subScore > rktScore) {
            subWin = true;
          } else if (rktScore > subScore) {
            rktWin = true;
          } else {
            tie = true;
          }
        } else if (subScore >= 100) {
          subWin = true;
        } else if (rktScore >= 100) {
          rktWin = true;
        }

        if (subWin) {
          this.ui.showMessage('Submarines win!');
        } else if (rktWin) {
          this.ui.showMessage('Rockets win!');
        } else if (tie) {
          this.ui.showMessage('It is a draw!');
        } else {
          this.ui.hideMessage();
          this.enableInteraction();
        }
      }, this));
    },
    performOutcomeStepForEach: function(steps) {
      var resolutions = [];
      var rktScore = this.model.get('rktScore');
      var subScore = this.model.get('subScore');

      _.each(steps, function(step) {
        var unitName = step.get('unit');
        var unit = this.world[unitName];
        var team = unitName.substr(0, 3);
        var other = team === 'sub' ? 'rkt' : 'sub';
        var teamFork = this.world[team + 'Fork'];
        var otherFork = this.world[other + 'Fork'];
        var stepType = step.get('type');
        var stepPosition = new Vector2().copy(step.get('position'));
        var scoreDelta = step.get('score') || 0;
        var fork;

        if (team === 'sub') {
          subScore += scoreDelta;
        } else {
          rktScore += scoreDelta;
        }

        switch (stepType) {
          case Outcome.type.MOVE_SHIELDED:
          case Outcome.type.MOVE:
            resolutions.push(unit.walkPath(step.get('points')).then(function() {
              // Noop..
            }));
            break;
          case Outcome.type.ATTACK:
            if (team !== this.model.get('team')) {
              unit.reveal();
            }
            resolutions.push(unit.fireLaser(step.get('points')[0]).then(_.bind(function() {
              if (team !== this.model.get('team')) {
                unit.conceal();
              }
            }, this)));
            break;
          case Outcome.type.DIE:
            unit.reveal();
            resolutions.push(unit.die().then(_.bind(function() {
              if (team !== this.model.get('team')) {
                unit.conceal();
              }
            }, this)));
            break;
          case Outcome.type.RESPAWN:
            unit.position = stepPosition;
            unit.reveal();
            resolutions.push(unit.respawn().then(_.bind(function() {
              if (team !== this.model.get('team')) {
                unit.conceal();
              }
            }, this)));
            break;
          case Outcome.type.PICKUP_FORK:
            if (team === 'sub') {
              fork = this.rktFork;
            } else {
              fork = this.subFork;
            }

            fork.set({
              position: null,
              carried: true,
              unit: unitName
            });

            unit.shield.visible = false;
            unit.append(otherFork);
            resolutions.push(q.resolve());
            break;
          case Outcome.type.RETURN_FORK:
            if (team === 'sub') {
              fork = this.subFork;
            } else {
              fork = this.rktFork;
            }

            fork.set({
              carried: false,
              unit: null,
              position: fork.get('origin')
            });
            resolutions.push(q.resolve());
            break;
          case Outcome.type.CAPTURE_FORK:
            this.world.items.append(teamFork);
            this.world.items.append(otherFork);

            this.subFork.set({
              position: this.subFork.get('origin').clone(),
              unit: null,
              carried: false
            });

            this.rktFork.set({
              position: this.rktFork.get('origin').clone(),
              unit: null,
              carried: false
            });
            resolutions.push(q.resolve());
            break;
          case Outcome.type.DROP_FORK:
            this.world.items.append(otherFork);
            otherFork.model.set({
              position: stepPosition.clone(),
              unit: null,
              carried: false
            });
            break;
        }

      }, this);

      return q.all(resolutions).then(_.bind(function() {
        this.model.set({
          rktScore: rktScore,
          subScore: subScore
        });
      }, this));
    },
    dispose: function() {
      this.world.heroAlpha.off(null, null, this);
      this.world.heroBeta.off(null, null, this);
      this.world.heroAlpha.model.off(null, null, this);
      this.world.heroBeta.model.off(null, null, this);
      this.world.off(null, null, this);
      this.ui.off(null, null, this);
      this.model.off(null, null, this);

      this.model = null;
      this.world = null;
      this.scene = null;
      this.ui = null;

      this.subFork = null;
      this.rktFork = null;
    },
    enableInteraction: function() {
      this.interactive = true;
      if (this.turn) {
        this.turn.off(null, null, this);
      }
      this.turn = new TurnModel({
        team: this.model.get('team')
      });
      this.turn.on('change', this.resetEndTurn, this);
      this.world.heroAlpha.reveal();
      this.world.heroBeta.reveal();
    },
    disableInteraction: function() {
      this.interactive = false;
      if (this.model.get('team')) {
        this.world.heroAlpha.model.set('points', []);
        this.world.heroBeta.model.set('points', []);
      }
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

      hero.shield.visible = toggled;

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

      if (!position.equals(companionWaypoints[companionWaypoints.length - 1]) &&
          !position.equals(hero.position)) {
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
      var name = entity.name;
      var team = name.substr(0, 3);
      var fork;

      if (team === 'sub') {
        fork = this.rktFork;
      } else {
        fork = this.subFork;
      }

      this.clearSelection();

      if (fork.get('carried') && fork.get('unit') === name) {
        entity.model.set('shielded', false);
        this.ui.disableModeForFork();
      } else {
        this.ui.enableMode();
        this.ui.model.set('modeToggled', entity.model.get('shielded'));
      }

      this.selected.push(entity);

      if (entity.focus) {
        entity.focus();
      }
    }
  });
});
