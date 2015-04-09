var DB = require("./db");
module.exports = new DB(require("./out/tree.json"));
module.exports.DB = DB;