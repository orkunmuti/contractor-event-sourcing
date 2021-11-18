var db = require("diskdb");
db.connect(__dirname + "/data", ["readcontracts"]);

module.exports = db;
