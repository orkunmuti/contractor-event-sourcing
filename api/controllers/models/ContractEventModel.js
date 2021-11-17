class ContractEvent {
  constructor({
    contractId = null,
    startDate = new Date(),
    endDate = null,
    premium = 100,
  }) {
    this.contractId = contractId || uuid();
    this.name = null;
    this.startDate = startDate;
    this.premium = premium || 0;
    this.endDate = endDate;
  }

  getValues() {
    return {
      contractId: this.contractId,
      name: this.name,
      startDate: this.startDate,
      premium: this.premium,
      endDate: this.endDate,
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
    this.endDate = new Date();
  }
}
