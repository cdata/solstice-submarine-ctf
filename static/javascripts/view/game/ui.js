define('view/game/ui',
       ['backbone', 'handlebars/templates', 'game/text'],
       function(Backbone, templates) {
  return Backbone.View.extend({
    tagName: 'section',
    id: 'Controls',
    events: {
      'click .exit': 'onClickExit',
      'click .mode': 'onClickMode',
      'click .end-turn': 'onClickEndTurn'
    },
    initialize: function() {
      this.model = new Backbone.Model({
        modeToggled: false,
        modeEnabled: false,
        endTurnEnabled: false,
        subScore: 0,
        rktScore: 0,
        message: null
      });

      this.model.on('change', this.invalidate, this);
    },
    dispose: function() {
      this.model.off();
      this.model = null;
    },
    render: function() {
      this.$el.html(templates.ui());
      this.$('.game-text').gameText();
      this.$subScore = this.$('.score .submarines .value');
      this.$rktScore = this.$('.score .rockets .value');
      this.$modeButton = this.$('.button.mode');
      this.$endTurnButton = this.$('.button.end-turn');
      this.$input = this.$('.input');
      this.$output = this.$('.output');
      this.$message = this.$('.output > span');
      return this;
    },
    invalidate: function() {
      this.$el.toggleClass('message', !!this.model.get('message'));
      this.$subScore.text(this.model.get('subScore'))
                    .gameText();
      this.$rktScore.text(this.model.get('rktScore'))
                    .gameText();
      this.$modeButton.toggleClass('disabled', !this.model.get('modeEnabled'));
      this.$modeButton.toggleClass('toggle', this.model.get('modeEnabled') && this.model.get('modeToggled'));
      this.$endTurnButton.toggleClass('disabled', !this.model.get('endTurnEnabled'));

      this.$message.empty();
      if (this.model.get('message')) {
        this.$message.text(this.model.get('message')).gameText();
      }
    },
    disableMode: function() {
      this.model.set('modeEnabled', false);
      this.model.set('modeToggled', false);
    },
    enableMode: function() {
      this.model.set('modeEnabled', true);
    },
    disableEndTurn: function () {
      this.model.set('endTurnEnabled', false);
    },
    enableEndTurn: function() {
      this.model.set('endTurnEnabled', true);
    },
    setScore: function(subs, rkts) {
      this.model.set('subScore', subs);
      this.model.set('rktScore', rkts);
    },
    showMessage: function(message) {
      this.model.set('message', message);
    },
    hideMessage: function() {
      this.model.set('message', null);
    },
    onClickExit: function() {
      this.trigger('click:exit');
    },
    onClickMode: function() {
      if (this.model.get('modeEnabled')) {
        this.model.set('modeToggled', !this.model.get('modeToggled'));
        this.trigger('click:mode', this.model.get('modeToggled'));
      }
    },
    onClickEndTurn: function() {
      if (this.model.get('endTurnEnabled')) {
        this.trigger('click:endTurn');
      }
    }
  });
});
