if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['game/object', 'backbone', 'underscore'],
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
      this.clearChildren();
    },
    appendAll: function(nodes) {
      var index;
      var node;

      for (index = 0, node = nodes[index]; index < nodes.length; node = nodes[++index]) {
        this.append(node);
      }
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

      if (node.parent) {
        if (node.parent !== this) {
          node.parent.remove(node);
        } else {
          return;
        }
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
      node.on('reveal', this.onChildReveal, this);

      return node;
    },
    unlink: function(node) {
      if (node.parent !== this) {
        throw new Error('Invalid node operation.');
      }

      var previous = node.previousSibling;
      var next = node.nextSibling;

      if (previous) {
        previous.nextSibling = next;
      } else {
        this.firstChild = next;
      }

      if (next) {
        next.previousSibling = previous;
      } else {
        this.lastChild = previous;
      }

      node.previousSibling = null;
      node.nextSibling = null;
      node.parent = null;

      node.off('draw', this.onNodeDraw, this);
      node.off('reveal', this.onChildReveal, this);

      return node;
    },
    onChildDraw: function(rect) {
      this.trigger('draw', rect);
    },
    onChildReveal: function(name, position) {
      this.trigger('reveal', name, position);
    },
    getChildren: function() {
      var children = [];
      var iter = this.firstChild;

      do {
        children.push(iter);
      } while (iter = iter.nextSibling);

      return children;
    },
    clearChildren: function() {
      var iter;

      while (this.firstChild) {
        iter = this.remove(this.firstChild);
        iter.dispose();
      }
    }
  });

  _.extend(Node.prototype, Backbone.Events);

  return Node;
})
