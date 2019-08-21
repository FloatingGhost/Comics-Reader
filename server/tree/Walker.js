//@ts-check

const naturalSort = require("natural-sort")();

const { TYPE_DIR } = require("./types");

module.exports = class TreeWalker {
  constructor(tree) {
    this.tree = tree;
    this.routes = {};
  }

  computeRoutes() {
    if (Object.keys(this.routes).length > 0) {
      return;
    }

    this.routes[""] = {
      name: this.tree.getName(),
      books: this.iterate(this.tree.getChildren())
    };
  }

  getBooks() {
    this.computeRoutes();
    return this.routes;
  }

  toJson() {
    this.computeRoutes();
    return this.routes;
  }

  iterate(entries) {
    if (!entries.length) {
      return [];
    }

    return entries
      .filter(row => row.getThumb())
      .map(row => {
        const data = {};

        // The books props differentiates dirs and books
        if (row.getType() === TYPE_DIR) {
          data.books = this.iterate(row.getChildren());
        }

        this.routes[row.getPath()] = data;

        return row.getName();
      })
      .sort(naturalSort);
  }
};
