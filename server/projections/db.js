const fs = require("fs");
const diskDb = require("diskdb");

const createDiskDB = () => {
    const contractsPath = __dirname + "/data/readcontracts.json";
    if (!fs.existsSync(contractsPath)) {
        fs.writeFileSync(contractsPath, JSON.stringify([]), (err) => console.log(error));
    }
    return createDbConnection();
}

const createDbConnection = () => {
    diskDb.connect(__dirname + "/data", ["readcontracts"]);
    return diskDb;
}

const db = createDiskDB();
module.exports = db;
