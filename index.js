var DB = require("./db");
module.export = new DB(require("./out/tree.json"));
module.exports.DB = DB;