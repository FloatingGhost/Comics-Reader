/* global process */
import path from "path";
import comicsIndex from "../../../../server/comics";
import { getPages } from "../../../../server/books";
import { fromUrl } from "../../../../server/utils";
import cache from "../../../../server/cache";
import { authenticate } from "../../../../server/auth";
import db from "../../../../server/db";

export default async (req, res) => {
  try {
    if (!comicsIndex.isReady) {
      res.status(503).send("Server Not Ready");
      return;
    }

    const user = await authenticate(req, res);
    if (!user) {
      return;
    }

    const book = fromUrl(req.query.book || "");

    let node;
    try {
      node = await comicsIndex.getNode(book);
    } catch (e) {
      console.log(e);
      res.status(404).send("Book not found");
      return;
    }

    const dirPath = path.join(process.env.DIR_COMICS, book);
    const key = `BOOK:v1:${dirPath}`;
    const pages = await cache.wrap(key, () => getPages(dirPath));

    const parent = node.parent ? node.parent.forClient() : null;

    const readBooks = db.getRead(user.user);
    const read = readBooks.indexOf(node.getPath()) !== -1;

    res.setHeader("Cache-Control", "no-cache");
    res.json({
      book: node.forClient(),
      parent,
      read,
      pages
    });
  } catch (e) {
    console.log("ERROR", e);
  }
};
