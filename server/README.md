# Getting started with server

This application is made by using `Node.js and Express library`. You can use [postman collection](https://github.com/orkunmuti/contractor-event-sourcing/blob/main/server/EventSourcing.postman_collection.json) to test endpoints.

### Scripts

In order to run the application, just open the server folder and run `npm install` and  `npm start` consecutively. The application will start serving at port `5000`.

## Architecture

Application makes uses of Event Sourcing and CQRS architecture. Since test data is event based and the current state of the system is built on top of that, 
I chose to go along with this kind of architecture, it is shown in detail below. I used an npm library called `node-event-sourcing` to implement such system because 
for a production project you need many technologies like `Kafka,ElasticSearch,Redis` etc. and it takes some time to implement those. The library uses it's internal classes to 
mock these services in one place.

Event sourcing let us store all user events in a database. So we can replay all user events to create the current state of the system, handle conflicts, make use of data science to 
produce insights etc.

Since the library offers the needed classes for such system, those are used to create the architecture. Detailed information is given below. 

All events are stored in a log file and in addition to that there is a in memory key,value type db which we can use to store events.

In order to send the user the latest state of a contract, we need to process the contract out of previous events. But it is kind of cumbersome to do this type of thing with every request.
That's why I have added an simple in memory database called `diskdb`. It's also a in memory database and stores the objects in a `json` file in the project directory. 
The responsibility of this database is to subscribe to the event store and to create the current state of the contract based on events. So it more like a conventional database where we use 
`CRUD` operations. This allows us from not processing every contract on `get` and single contract in `post` requests. In terms of `CQRS`, this db is used for `Query` part mostly, 
that is updated by `Commands`.

![image](https://user-images.githubusercontent.com/16900879/142380001-b11d8025-07f1-4f39-96dd-2c53cd5fb30c.png)

- Event Receiver — Entrypoint for all your events. You can call it from a microservice, it will publish the events to your Queue service.

- Event Archivist — Subscribes to the event Queue and stores them in your Event Store.

- Event Processor — Subscribes to the event Queue, apply the event to the current state, and then saves it to the State Store.

- State Reader — Connects to the State Store to get or subscribe to state changes. You can expose it through a microservice.

If this was a production project, architecture could be like below:

![image](https://user-images.githubusercontent.com/16900879/142380577-99197be8-924d-41fa-a041-c5c09b61b3cd.png)

## On Startup

Before the application starts, we need to make use of a startup function because we have already have test data in hand and want to bootstrap the application with this data. 
Startup script basically checks if the `diskdb/contracts` is empty and based on this result reads the `test-data-full-stack.txt` line by line to create `events` and also updates the `diskdb` based on those events.

## API Design

The endpoints are not designed like `REST` because we use `CQRS` and REST mostly can't handle those type of requests gracefully. We might have 5 operations on `contracts`, so `GET,POST,PATCH,DELETE` etc. won't be enough to cover all cases. That is why, the endpoints are architectured as `RPC`. 

### For example:

IN REST:  `POST/contracts`

IN RPC:  `POST/contracts/createContract` (used)

## Endpoints

There are 3 endpoints, which are for `get contracts` , `create contract` and `terminate contract`.

`GET /contracts?page={1}&limit=20`

Send paginated contracts to user that is sorted by `startDate`. To make use of `RPC` based enpoint, we also could have used `contracts/getContracts`, but for this project we don't need that.

`POST /contracts/createContract`

Creates a contract and returns the result to the user. Since this a sample project, a default contract is created and we don't need any input request body for this operation. 
`Eventual Consistency` is used here to make `UI/UX` better for the client. We assume that the operation is successful and return an instance of a contract to the user before database operations end. Of course this is a trade off, there might be cases where `ACID` properties and consistency is too important. Based on requirements `Strong consistency` also can be used by waiting until the operation ends. Or we can make the contract state `processing` and send this to user. When the operation ends, a queueing system like `RabbitMQ` can send the recent state of the contract to the user.

`POST /contracts/terminateContract`

Terminates the contract and returns the new state of the contract to the user. In this case only the `terminationDate` changes and we apply the change to our current array. Again `Eventual Consistency` is here as explained above. The client sends the contract to be terminated in the request body in `json` format.

## What happens when client sends a post request through API, for example creating contract?

- `Receiver`, `Archiver`,`Processor`,`State Reader` are initialized when the express app is started.

- `Receiver` is responsible of emitting events based on client requests

- `Archiver` is responsible of logging events

- `Processor` is responsible of handling events sent by `Receiver`, in our case it updates state db.

- `State Reader` is responsible of storing events in `key-value` fashion, in our case `contractId` is key and related `events` array is value.

- Request comes to `/contracts/createContrat` and runs the related `createContract` controller asynchronously.

- We need to create and event which maps to this command. `ContractCreatedEvent` is created.

- `Receiver` emits this event

- `Processor` grabs the event and updates the `State Reader`

- `Archiver` logs the event

- `State Reader` is subscribed to change on `contractId`, calls `createReadContract` function to update `diskdb`

- `DiskDb` checks if there is no duplicate `contractId`, if not saves the new contract to `json` file

- `createContract` controller returns the `ContractCreatedEvent` event to the client before whole process ends which leads to `Eventual consistency`

## Models

`ContractEvent` is the base class for creating contract related events, it is comprised fields which is given in test data. Compared to test data, `uuid` is used as `id` to be able to handles uniquness.

`ContractCreatedEvent` and `ContractTerminatedEvent` inherits `ContractEvent`

## ReadStore

Consists of the functions that runs when `create` or `terminate` events happen. Responsible for updating `diskdb` which is only for showing last state of the contracts to the clients. Read db is temporary and not that important, because we can create it by replaying the events when in case of a data loss.

## EventStore

Initializes the event sourcing classes

## EventHandlers

Handles the events that comes from `Receiver`

## Projections

Stores the initial `test` data and `projection` data that we show to customer

## Data

Stores the `eventLogs` but ignored in .git, you can see it in your local folder if you happen to run any event

#Tests

You can run the tests by `npm test` command.

There are 4 tests in the suite, which are for:

- Test if GET contracts endpoint is working fine

- Test if POST contract/createContract is working fine and returning a stable result

- Test if POST contract/terminateContract would fail if we supply no body in the request

- Test if POST contract/terminateContract is working fine and returning a stable result based on the before function we ran before starting tests.

You can see also see all of the tests [from here](https://github.com/orkunmuti/contractor-event-sourcing/blob/main/server/test/apiTest.js)

