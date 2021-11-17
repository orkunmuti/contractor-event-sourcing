const events = {
  ContractCreatedEvent: "ContractCreatedEvent",
  ContractTerminatedEvent: "ContractTerminatedEvent",
};

const eventFuncs = {
  ContractCreatedEvent: createReadContract,
  ContractTerminatedEvent: terminateReadContract,
};
