const fs = require("fs");

const createDiskDB = () => {
    const contractsPath = __dirname + "/data/readcontracts.json";
    if (!fs.existsSync(contractsPath)) {
        fs.writeFileSync(contractsPath, JSON.stringify([]), (err) => console.log(error));
    }

    var db = require("diskdb");
    db.connect(__dirname + "/data", ["readcontracts"]);
    return db;
}

const db = createDiskDB();
module.exports = db;
