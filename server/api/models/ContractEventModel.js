const { v4: uuid } = require("uuid");
const { events } = require("../constants/events");

class ContractEvent {
  constructor({
    contractId = null,
    startDate,
    terminationDate,
    premium = 100,
  }) {
    this.contractId = contractId || uuid();
    this.name = null;
    this.startDate = startDate || new Date();
    this.premium = premium || 0;
    this.terminationDate = terminationDate;
  }

  getValues() {
    return {
      contractId: this.contractId,
      name: this.name,
      startDate: this.startDate,
      premium: this.premium,
      terminationDate: this.terminationDate,
    };
  }
}

class ContractCreatedEvent extends ContractEvent {
  constructor(args) {
    super(args);
    this.name = events.ContractCreatedEvent;
  }
}

class ContractTerminatedEvent extends ContractEvent {
  constructor(args) {
    super(args);
    this.name = events.ContractTerminatedEvent;
    this.terminationDate = args?.terminationDate || new Date();
  }
}

module.exports = { ContractCreatedEvent, ContractTerminatedEvent };
