import assert from 'assert'

const DB = require("../db")

const expectations = [
  {
    tree: {

    },
    query: {
      tabell: "befolkning_hovedgruppe",
      time: "latest", // "1985", "1989-2015", ["1989","1990","1991"], "1989,1990,1991"
      dimensions: ["innvkat5", "kjonn", "enhet.person"]
    },
    result: {
      befolkning_hovedgruppe: {
        time: {
          timestamps: ['2001-01-01', 2002, 2003]
        },
        innvkat5: {
          asia: {
            kjonn: {
              "1": {
                enhet: {
                  prosent: [23.5, 40.2, null],
                  person: [,,,]
                }
              }
            }
          },
          afrika: {}
        }
      }
    }
  }

];

describe('query/response', ()=> {
  expectations.forEach(expectation => {
    const db = new DB(expectation.tree);
    return db.query(expectation.query)
      .then(result => {
        assert.deepEqual(result, expectation.result);
      })
  });
});
