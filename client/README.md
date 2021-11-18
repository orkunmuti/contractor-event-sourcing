# Getting Started with client code

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

All api requests are directed to server with `http://localhost:5000` proxy which is defined in `package.json`

## Folder structure

Since we have 1 page to show, project only consists of additional `/components` folder for React components and `/constants` for types, api information etc.

# Components

## ContractList

`ContractList` is the main component used for applying user related tasks like show/create/terminate contracts. Additional `material/ui` library is used for production ready styled components.

### Show contracts

When the user opens the home page, a request is sent to server to get current contracts sorted by `startDate` based on `page` and `pageLimit` info. There is an additional `Pagination` component on the bottom which is responsible of change the current page. There is an `useEffect` hook implemented to handle the new data when the page changes.

### Create contract

When the user clicks `Create Contract` button, post request is sent to server and the resulting data is joined with the recent data that comes from the response.

### Terminate contract

When the user clicks `TrashIcon` on the row, post request is sent to server and the resulting data's terminationDate is applied to the selected contract.

## Dialog

`Dialog` is used for showing user dialog when they want to create/terminate contract. The dialog content(title,description) and also the callback function which runs when the user accepts the dialog changes dynamically via props given by parent component.

# Routing

No routing has been used since there is only page to show.
