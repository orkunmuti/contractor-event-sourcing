const readline = require("readline");
const fs = require("fs");
const {
  ContractCreatedEvent,
  ContractTerminatedEvent,
} = require("./api/models/ContractEventModel");
const { events, eventFuncs } = require("./api/constants/events");

const { receiver, state } = require("./api/events/eventStore");

const createEventInstance = (event) => {
  const { name, premium, contractId, startDate, endDate } = event;

  if (event.name === events.ContractCreatedEvent) {
    return new ContractCreatedEvent({
      name,
      premium,
      contractId,
      startDate,
      endDate,
    });
  } else {
    return new ContractTerminatedEvent({
      name,
      premium,
      contractId,
      startDate,
      endDate,
    });
  }
};

const initializeDb = () => {
  const reads = JSON.parse(
    fs.readFileSync(__dirname + "/projections/data/readcontracts.json")
  );

  if (reads.length > 0) return;

  const readInterface = readline.createInterface({
    input: fs.createReadStream(
      __dirname + "/projections/data/test-data-full-stack.txt"
    ),
    console: false,
  });

  readInterface.on("line", function (line) {
    let event = JSON.parse(line);
    event = createEventInstance(event);

    const { contractId, name } = event;
    const eventToEmit = { eventType: name, event };
    receiver.emit(eventToEmit);
    state.subscribe(contractId, () => updateReadDb(event));
    state.unsubscribe(contractId);
  });
};

module.exports = { initializeDb };
