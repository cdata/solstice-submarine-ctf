define('game/node',
       ['game/object', 'backbone', 'underscore'],
       function(GameObject, Backbone, _) {
  var Node = GameObject.extend({
    initialize: function() {
      this.nextSibling = null;
      this.previousSibling = null;
      this.firstChild = null;
      this.lastChild = null;
      this.parent = null;
    },
    dispose: function() {
      if (this.firstChild) {
        var iter = this.firstChild;

        do {
          iter.dispose();
        } while (iter = iter.nextSibling);
      }

      this.parent = null;
    },
    append: function(node) {
      return this.insertAfter(node, this.lastChild);
    },
    prepend: function(node) {
      return this.insertBefore(node, this.firstChild);
    },
    insertAfter: function(node, sibling) {
      return this.link(node,
                sibling || this.lastChild,
                sibling && sibling.nextSibling);
    },
    insertBefore: function(node, sibling) {
      return this.link(node,
                sibling && sibling.previousSibling,
                sibling || this.firstChild);
    },
    remove: function(node) {
      return this.unlink(node);
    },
    link: function(node, previous, next) {
      if ((previous && previous.parent !== this) ||
          (next && next.parent !== this)) {
        throw new Error('Invalid node operation.');
      }

      if (node.parent && node.parent !== this) {
        node.parent.remove(node);
      }

      node.previousSibling = previous;
      node.nextSibling = next;
      node.parent = this;

      if (!previous) {
        this.firstChild = node;
      } else {
        previous.nextSibling = node;
      }

      if(!next) {
        this.lastChild = node;
      } else {
        next.previousSibling = node;
      }

      node.on('draw', this.onChildDraw, this);

      return node;
    },
    unlink: function(node) {
      if (node.parent !== this) {
        throw new Error('Invalid node operation.');
      }

      var previous = node.previousSibling;
      var next = node.nextSibling;

      if (previous) {
        previous.nextSibilng = next;
      } else {
        this.firstChild = next;
      }

      if (next) {
        next.previousSibling = previous;
      } else {
        this.lastChild = previous;
      }

      node.off('draw', this.onNodeDraw, this);

      return node;
    },
    onChildDraw: function(rect) {
      rect.setX(rect.getX() + this.position.x);
      rect.setY(rect.getY() + this.position.y);

      this.trigger('draw', rect);
    },
    getChildren: function() {
      var children = [];
      var iter = this.firstChild;

      do {
        children.push(iter);
      } while (iter = iter.nextSibling);

      return children;
    }
  });

  _.extend(Node.prototype, Backbone.Events);

  return Node;
})
