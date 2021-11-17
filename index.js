const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 5000;

const readline = require("readline");
const fs = require("fs");
const { v4: uuid } = require("uuid");

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

const {
  EventReceiver,
  EventArchivist,
  EventProcessor,
  StateReader,
} = require("node-event-sourcing");

var db = require("diskdb");
db = db.connect("projections", ["readcontracts"]);

const receiver = new EventReceiver();
const archivist = new EventArchivist();
archivist.run();

const processor = new EventProcessor();

processor.on(events.ContractCreatedEvent, async (event, stateStore) => {
  onContractUpdate(event, stateStore);
});

processor.on(events.ContractTerminatedEvent, async (event, stateStore) => {
  onContractUpdate(event, stateStore);
});

const onContractUpdate = async (event, stateStore) => {
  const { event: data } = event;
  const { contractId } = data;
  console.log("event happening", data.name);
  const collection = (await stateStore.lockAndGet(contractId)) || [];
  collection.push(data.getValues());
  await stateStore.set(contractId, collection);
};

const state = new StateReader();

const updateReadDb = (event) => {
  const { name } = event;
  eventFuncs[name](event);
};

const initializeDb = () => {
  const reads = JSON.parse(
    fs.readFileSync(__dirname + "/projections/readcontracts.json")
  );

  if (reads.length > 0) return;

  const readInterface = readline.createInterface({
    input: fs.createReadStream(__dirname + "/test/test-data-full-stack.txt"),
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

initializeDb();
app.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
