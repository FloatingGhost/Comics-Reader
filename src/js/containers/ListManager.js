import React from "react";
import { connect } from "react-redux";

import Header from "../components/Header";
import List from "../components/List";
import { isRead } from "../reducers/read";
import { listBooksInside } from "../reducers/books";

class ListManager extends React.Component {

  componentDidMount() {
    document.title = this.props.dir.name;
  }

  render() {
    const { location, dir, parent, books } = this.props;
    return (
      <div>
        <Header url={location.pathname} title={dir.name} parent={parent} />
        <div className="Content">
          <List books={books} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let path =
    (ownProps.location && ownProps.location.pathname.replace("/list/", "")) ||
    "";

  if (path === "/") {
    path = "";
  }

  const allBooks = state.books.books;

  const dir = allBooks[path] || {};

  let parent = {};
  if (dir.parent !== undefined) {
    parent = allBooks[dir.parent] || {};
  }

  let books = [];
  if (dir.books) {
    books = dir.books
      .map(book => allBooks[book] || {})
      .map(book => {
        book.read = isRead(state.read.read, book.path);
        const booksInside = listBooksInside(allBooks, book.path);
        book.booksInsideRead = booksInside.filter(innerBook => isRead(state.read.read, innerBook)).length;
        book.booksInside = booksInside.length;
        return book;
      });
  }

  return {
    path,
    dir,
    parent,
    books
  };
};

export default connect(mapStateToProps)(ListManager);
