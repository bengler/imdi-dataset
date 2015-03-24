const fs = require("fs");
const path = require("path");
const assert = require("chai").assert;
const DB = require("../db");

const expectations = fs.readdirSync(__dirname+'/expectations').map(filename => {
  const expectation = require(path.join(__dirname, '/expectations', filename));

  return Object.assign(expectation, {
    filename: filename
  });
});

describe('query/response', ()=> {
  expectations.forEach(({tree, result, query, filename}) => {

    const humanizedTitle = path.basename(filename, path.extname(filename)).replace(/_/g, " ");

    it(`Expectation in "${humanizedTitle}" works`, ()=> {
      return new DB(tree).query(query).then(actual => assert.deepEqual(actual, result))
    });
  });
});
