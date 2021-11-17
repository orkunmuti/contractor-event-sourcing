const { EventProcessor } = require("node-event-sourcing");
const { events } = require("../constants/events");

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
  const collection = (await stateStore.lockAndGet(contractId)) || [];
  collection.push(data.getValues());
  await stateStore.set(contractId, collection);
};

module.exports = { processor };
