const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const contractRouter = require("./api/routes/contractRouter");

const { initializeDb } = require("./startup");

app.use(bodyParser.json());
app.use(cors());
app.use("/contracts", contractRouter);

const port = process.env.PORT || 5000;

initializeDb();
app.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);

module.exports = app;