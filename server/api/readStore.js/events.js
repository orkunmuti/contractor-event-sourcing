const db = require("../../projections/db");

const readContracts = () => {
  try {
    const contracts = db.readcontracts?.find();
    return contracts;
  } catch (error) {
    console.log(error);
  }
}

const createReadContract = (event) => {
  try {
    const { contractId } = event;
    const item = db.readcontracts?.findOne({ contractId });
    if (item) return;
    delete event.name;
    event.terminationDate = null;
    db.readcontracts.save(event);
  } catch (error) {
    console.log(error)
  }
};

const terminateReadContract = (event) => {
  try {
    const { contractId } = event;
    const item = db.readcontracts?.findOne({ contractId });
    if (!item) return;
    delete event.name;

    const query = { contractId };
    const dataToUpdate = { ...event, terminationDate: event.terminationDate };
    const options = { multi: false, upsert: false };
    db.readcontracts.update(query, dataToUpdate, options);
  } catch (error) {
    console.log(error)
  }
};

const eventFuncs = {
  ContractCreatedEvent: createReadContract,
  ContractTerminatedEvent: terminateReadContract,
};

const updateReadDb = (event) => {
  try {
    if (event == null || event.name == null) return;
    const { name } = event;
    eventFuncs[name](event);
  } catch (error) {
    console.log(error)
  }
};

module.exports = { createReadContract, terminateReadContract, updateReadDb, readContracts };
