import React, { useState } from "react";

import { fetchWithAuth } from "../../fetch";
import withAuth, { useAuth } from "../../hoc/withAuth";
import withIndexReady from "../../hoc/withIndexReady";
import Book from "../../components/Book";
import Layout from "../../components/Layout";
import { imageData, urlizeNode } from "../../utils";

function markRead(token, book) {
  return fetchWithAuth(token, `read/${urlizeNode(book)}`, {
    method: "POST"
  });
}

function BookManager({
  currentUrl,
  path,
  book,
  parent,
  pages,
  read,
  isRetina,
  supportsWebp
}) {
  const [isRead, setRead] = useState(read);
  const { token } = useAuth();

  return (
    <Layout url={currentUrl} current={book} parent={parent}>
      <div className="Content Content--gallery">
        <Book
          isRetina={isRetina}
          supportsWebp={supportsWebp}
          pages={pages}
          read={isRead}
          onRead={() => {
            markRead(token, path).then(() => {
              setRead(true);
            });
          }}
        />
      </div>
    </Layout>
  );
}

BookManager.getInitialProps = async ({ query, req, token }) => {
  const path = query.book;
  const url = `/book/${path}`;

  const { isRetina, supportsWebp } = imageData(req);

  const { book, parent, pages, read } = await fetchWithAuth(
    token,
    `book/${encodeURIComponent(path)}`
  );

  return {
    isRetina,
    supportsWebp,
    currentUrl: url,
    path,
    book,
    parent,
    pages,
    read
  };
};

export default withAuth(withIndexReady(BookManager));
