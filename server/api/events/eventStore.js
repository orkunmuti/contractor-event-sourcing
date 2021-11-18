const {
  EventReceiver,
  EventArchivist,
  StateReader,
} = require("node-event-sourcing");

const processor = require("./eventHandlers");

const receiver = new EventReceiver();
const archivist = new EventArchivist();
const state = new StateReader();

archivist.run();

module.exports = { receiver, state, processor };
