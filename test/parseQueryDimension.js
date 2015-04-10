const debug = require('debug')('imdi-dataset:db');
const assert = require('chai').assert;

const expandQueryDimension = require("../lib/parseQueryDimension");

const expectations = {
  'innvkat_5:*': {
    label: "innvkat_5",
    all: true
  },
  ' innvkat_5': {
    label: "innvkat_5",
    all: true
  },
  'innvkat_5': {
    label: "innvkat_5",
    all: true
  },
  'kjonn:alle': {
    label: "kjonn",
    include: ['alle']
  },
  'kjonn:alle,0,1': {
    label: "kjonn",
    include: ['alle', '0', '1']
  },
  // All with some to include and some exclude
  'kjonn:*,-1,0': {
    label: "kjonn",
    all: true,
    include: ['0'],
    exclude: ['1']
  }
};

describe('Query dimension parsing', ()=> {
  Object.keys(expectations).forEach(queryDimension => {
    const expectation = expectations[queryDimension];
    describe(`Query dimension "${queryDimension}"`, () => {
      it(`parses to to ${JSON.stringify(expectation)}`, () => {
        assert.deepEqual(expandQueryDimension(queryDimension), expectation)
      })
    })
  });
  describe("Sanity checking", ()=> {
    it(`throws if varible is marked as both include and exclude`, () => {
      assert.throws(()=> expandQueryDimension("invkat_5:a,-a"));
      assert.throws(()=> expandQueryDimension("kjonn:*,-1,0,1"));
    });
  });
});
