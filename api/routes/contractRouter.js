const express = require("express");
const contractRouter = express.Router();

app.get("/contracts", getContracts);
app.post("/contracts/createContract", createContract);
app.post("/contracts/terminateContract", terminateContract);

module.exports = contractRouter;
