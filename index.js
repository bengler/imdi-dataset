var DB = require("./db");
module.exports.DATA_FILE = require.resolve("./out/tree.json");
module.exports.DB = DB;
module.exports.parseQueryDimension = require("./lib/parseQueryDimension");