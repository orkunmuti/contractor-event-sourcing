const readline = require("readline");
const fs = require("fs");
const {
  ContractCreatedEvent,
  ContractTerminatedEvent,
} = require("./api/models/ContractEventModel");
const { events, eventFuncs } = require("./api/constants/events");

const { receiver, state } = require("./api/events/eventStore");
const { updateReadDb } = require("./api/readStore.js/events");

const createEventInstance = (event) => {
  const { name, premium, contractId, startDate, terminationDate } = event;

  if (event.name === events.ContractCreatedEvent) {
    return new ContractCreatedEvent({
      name,
      premium,
      contractId,
      startDate,
      terminationDate,
    });
  } else {
    return new ContractTerminatedEvent({
      name,
      premium,
      contractId,
      startDate,
      terminationDate,
    });
  }
};

const initializeDb = () => {
  try {
    const contractsPath = __dirname + "/projections/data/readcontracts.json";
    const reads = JSON.parse(fs.readFileSync(contractsPath));

    if (reads.length > 0) return;

    const readInterface = readline.createInterface({
      input: fs.createReadStream(
        __dirname + "/projections/test-data-full-stack.txt"
      ),
      console: false,
    });

    readInterface.on("line", function (line) {
      try {
        let event = JSON.parse(line);
        event = createEventInstance(event);

        const { contractId, name } = event;
        const eventToEmit = { eventType: name, event };
        receiver.emit(eventToEmit);
        state.subscribe(contractId, () => updateReadDb(event));
        state.unsubscribe(contractId);
      } catch (error) {
        console.log(error)
      }

    });
  } catch (error) {
    console.log(error)
  }

};

module.exports = { initializeDb };
