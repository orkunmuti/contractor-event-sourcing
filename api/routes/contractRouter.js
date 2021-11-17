const express = require("express");
const contractRouter = express.Router();
const {
  getContracts,
  createContract,
  terminateContract,
} = require("../controllers/contractController");

contractRouter.get("/", getContracts);

contractRouter.post("/createContract", createContract);

contractRouter.post("/terminateContract", terminateContract);

module.exports = contractRouter;
