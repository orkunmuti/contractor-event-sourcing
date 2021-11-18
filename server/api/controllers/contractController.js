const { receiver, state } = require("../events/eventStore");
const {
  ContractCreatedEvent,
  ContractTerminatedEvent,
} = require("../models/ContractEventModel");
const { updateReadDb, readContracts } = require("../readStore.js/events");

const getContracts = async (req, res) => {
  try {
    let { page = 1, limit = 20 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const contracts = readContracts() || [];
    contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const totalPages = Math.ceil(contracts.length / limit);
    const offset = (page - 1) * limit;

    const dataToSend = contracts.slice(offset, offset + limit);
    dataToSend.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    res.send({ data: dataToSend, totalPages, page });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createContract = async (req, res) => {
  try {
    const { premium = 100 } = req.query;
    const event = new ContractCreatedEvent({ premium });
    const { contractId, name } = event;
    const eventToEmit = { eventType: name, event };

    receiver.emit(eventToEmit);
    state.subscribe(contractId, () => updateReadDb(event));
    state.unsubscribe(contractId);
    res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const terminateContract = async (req, res) => {
  try {
    const { contractId = null, startDate, premium } = req.body;
    if (contractId == null || startDate == null)
      throw new Error("Invalid body.");

    const event = new ContractTerminatedEvent({
      contractId,
      startDate,
      premium,
    });
    const { name } = event;
    const eventToEmit = { eventType: name, event };

    receiver.emit(eventToEmit);
    state.subscribe(contractId, () => updateReadDb(event));
    state.unsubscribe(contractId);
    return res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getContracts,
  createContract,
  terminateContract,
};
