//@ts-check
const next = require("next");
const chalk = require("chalk");
const express = require("express");
const tus = require('tus-node-server');
const path = require("path");
const fs = require("fs");
const EVENTS = require('tus-node-server').EVENTS;

const loudRejection = require("loud-rejection");
const compression = require("compression");
const morgan = require("morgan");

require("./env");

// Kickstart index creation
require("./comics");

const title = chalk.underline.bold;

const app = next({
  dev: process.env.NODE_ENV !== "production",
  dir: process.cwd()
});
const handle = app.getRequestHandler();

loudRejection();


console.log(title("Starting server"));

app.prepare().then(() => {
  const server = express();
  const uploadApp = express(); 
  const tusServer = new tus.Server();
  const moveFile = (id, metadata) => {
    const keys = {};
    metadata.split(',').forEach(meta => {
        const [k, v] = meta.split(' ');
        keys[k] = atob(v);
    });
    console.log(id, keys, process.env.DIR_COMICS);
    fs.mkdirSync(path.resolve(process.env.DIR_COMICS, keys.workName), { recursive: true });
    fs.renameSync(path.resolve(process.env.DIR_COMICS, id), path.resolve(process.env.DIR_COMICS, `${keys.workName}/${keys.filename}`));
  }
  tusServer.datastore = new tus.FileStore({
      path: "/images"
  });
  tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, (event) => {
    moveFile(event.file.id, event.file.upload_metadata);
  });
  uploadApp.all('*', tusServer.handle.bind(tusServer));
  server.use('/upload-file', uploadApp);

  server.use(compression()); // Enable Gzip
  server.use(morgan("tiny")); // Access logs

  // Static assets
  server.use("/images", express.static("images"));
  server.get(/\/images\/cache\/([a-zA-Z]*)\/(.*)/, require("./api/imagecache"));

  server.all("*", (req, res) => {
    handle(req, res);
  });

  server.listen(process.env.SERVER_PORT);

  console.log(title(`Started server on ${process.env.SERVER_URL}`));
});
