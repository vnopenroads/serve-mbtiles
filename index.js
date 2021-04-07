require("dotenv").config();
const express = require("express");
const MBTiles = require("@mapbox/mbtiles");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3000;
const mbtilesPath = process.env.MBTILES_PATH;
let mbtiles;

function loadMbtilesFile() {
  mbtiles = new MBTiles(`${mbtilesPath}?mode=ro`, function (err, mbtiles) {
    console.log(err, mbtiles); // mbtiles object with methods listed below
    if (err) {
      console.log("Please check your mbtiles file. Exiting...");
      process.exit(1);
    }
  });
}

fs.watchFile(mbtilesPath, (curr, prev) => {
  console.log(`${mbtilesPath} file Changed`);

  loadMbtilesFile();
});

loadMbtilesFile();


app.use(cors());

app.get("/:z/:x/:y.vector.pbf", (req, res) => {
  const { x, y, z } = req.params;
  mbtiles.getTile(z, x, y, function (err, data, headers) {
    if (err) {
      console.error(err);
      res.status(500).send();
    }
    Object.keys(headers || {}).forEach((k) => res.setHeader(k, headers[k]));
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
