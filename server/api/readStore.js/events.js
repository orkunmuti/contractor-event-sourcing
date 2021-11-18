const db = require("../../projections/db");

const createReadContract = (event) => {
  const { contractId } = event;
  const item = db.readcontracts.findOne({ contractId });
  if (item) return;
  delete event.name;
  db.readcontracts.save(event);
};

const terminateReadContract = (event) => {
  const { contractId } = event;
  const item = db.readcontracts.findOne({ contractId });
  if (!item) return;
  delete event.name;

  const query = { contractId };
  const dataToUpdate = { ...event, terminationDate: event.terminationDate };
  const options = { multi: false, upsert: false };
  db.readcontracts.update(query, dataToUpdate, options);
};

const eventFuncs = {
  ContractCreatedEvent: createReadContract,
  ContractTerminatedEvent: terminateReadContract,
};

const updateReadDb = (event) => {
  if (event == null || event.name == null) return;
  const { name } = event;
  eventFuncs[name](event);
};

module.exports = { createReadContract, terminateReadContract, updateReadDb };
