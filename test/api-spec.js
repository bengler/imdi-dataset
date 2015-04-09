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

describe('DB', ()=> {
  describe('#query()', ()=> {
    expectations.forEach(({pending, tree, result, query, filename}) => {

      const humanizedTitle = path.basename(filename, path.extname(filename)).replace(/_/g, " ");

      const _it = pending ? xit : it;
      _it(`Expectation in "${humanizedTitle}" works`, ()=> {
        return new DB(tree).query(query).then(actual => assert.deepEqual(actual, result))
      });
    });
  });
  describe('#getAllPossibleTimesForTable()', ()=> {
    it("returns all root keys of the tree object, in lexical order", ()=> {
      const db = new DB({
        table1: {
          '2014': {},
          '2012': {},
          '2013': {}
        },
        table2: {
          '2014': {},
          '2013': {}
        }
      });
      return db.getAllPossibleTimesForTable('table1').then(times => {
        assert.deepEqual(['2012', '2013', '2014'], times)
      })
    });
    it("leaves out everything that doesn't look like a year", ()=> {
      const db = new DB({
        footable: {
          '2014': {},
          '2013': {},
          '2005-2010': {},
          '2002_2005': {},
          'blahblah': {},
          '2012': {}
        }
      });
      return db.getAllPossibleTimesForTable('footable').then(times => {
        assert.deepEqual(['2012', '2013', '2014'], times)
      })
    });
  });
  describe('#getAllPossibleTimes()', ()=> {
    it("returns all root keys of the tree object, in lexical order", ()=> {
      const db = new DB({
        table1: {
          '2014': {},
          '2012': {},
          '2013': {}
        },
        table2: {
          '2014': {},
          '2012': {}
        }
      });
      return db.getAllPossibleTimes().then(times => {
        assert.deepEqual({
          table1: ['2012', '2013', '2014'],
          table2: ['2012', '2014']
        }, times);
      })
    });

    it("leaves out everything that doesn't look like a year", ()=> {
      const db = new DB({
        footable: {
          '2014': {},
          '2013': {},
          '2005-2010': {},
          '2002_2005': {},
          'blahblah': {},
          '2012': {}
        },
        bartable: {
          'blahblah': {},
        }
      });
      return db.getAllPossibleTimes().then(times => {
        assert.deepEqual({
          footable: ['2012', '2013', '2014'],
          bartable: []
        }, times)
      })
    });
  });

});
