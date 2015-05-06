const debug = require('debug')('imdi-dataset:db');
const assert = require('chai').assert;

const QueryDimension = require("../.compiled/util/QueryDimension");

const EXPECT = {
  parse: {
    'innvkat_5:*': {
      label: "innvkat_5",
      any: true
    },
    ' innvkat_5': {
      label: "innvkat_5",
      any: true
    },
    'innvkat_5': {
      label: "innvkat_5",
      any: true
    },
    'kjonn:alle': {
      label: "kjonn",
      include: ['alle']
    },
    'kjonn:alle,0,1': {
      label: "kjonn",
      include: ['alle', '0', '1']
    },
    'kjonn : alle, 0 ,1  ': {
      label: "kjonn",
      include: ['alle', '0', '1']
    },
    'kjonn : ': {
      label: "kjonn",
      any: true
    },
    // any with some to include and some exclude
    'kjonn:*,-1,0': {
      label: "kjonn",
      any: true,
      include: ['0'],
      exclude: ['1']
    }
  },
  stringify: {
    'innvkat_5:*,bar,-foo': {
      label: "innvkat_5",
      any: true,
      exclude: ['foo'],
      include: ['bar']
    },
    'innvkat_5': {
      label: "innvkat_5",
      any: true
    },
    'kjonn:alle,1': {
      label: "kjonn",
      include: ['alle', '1']
    },
    'kjonn:alle,0,1': {
      label: "kjonn",
      include: ['alle', '0', '1']
    }
  }
};

describe('Query dimension parsing/stringifying', ()=> {
  describe("#parse", ()=> {
    const expectations = EXPECT.parse
    Object.keys(expectations).forEach(queryDimension => {
      const expectation = expectations[queryDimension];
      describe(`Query dimension "${queryDimension}"`, () => {
        it(`parses to to ${JSON.stringify(expectation)}`, () => {
          assert.deepEqual(QueryDimension.parse(queryDimension), expectation)
        })
      })
    });
    describe("Sanity checking", ()=> {
      it(`throws if varible is marked as both include and exclude`, () => {
        assert.throws(()=> QueryDimension.parse("invkat_5:a,-a"));
        assert.throws(()=> QueryDimension.parse("kjonn:*,-1,0,1"));
      });
    });
  });
  describe("#stringify", ()=> {
    const expectations = EXPECT.stringify;
    Object.keys(expectations).forEach(stringified => {
      const parsed = expectations[stringified];
      describe(`Query dimension "${JSON.stringify(parsed)}"`, () => {
        it(`stringifies to to ${stringified}`, () => {
          assert.deepEqual(stringified, QueryDimension.stringify(parsed))
        })
      })
    });
  });
});
