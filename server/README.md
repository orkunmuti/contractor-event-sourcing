# Getting started with server

This application is made by using `Node.js and Express library`.

### Scripts

In order to run the application, just open the server folder and run `npm start` command. The application will start serving at port `5000`.

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
`CRUD` operations. This allows us from not processing every contract on `get` and single contract in `post` requests.

![image](https://user-images.githubusercontent.com/16900879/142380001-b11d8025-07f1-4f39-96dd-2c53cd5fb30c.png)

- Event Receiver — Entrypoint for all your events. You can call it from a microservice, it will publish the events to your Queue service.

- Event Archivist — Subscribes to the event Queue and stores them in your Event Store.

- Event Processor — Subscribes to the event Queue, apply the event to the current state, and then saves it to the State Store.

- State Reader — Connects to the State Store to get or subscribe to state changes. You can expose it through a microservice.

If this was a production project, architecture could be like below:

![image](https://user-images.githubusercontent.com/16900879/142380577-99197be8-924d-41fa-a041-c5c09b61b3cd.png)
