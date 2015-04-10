import pick from 'lodash.pick';
const reduceKV = require("./lib/kv-reduce");
const chunk = require("lodash.chunk");
const dotty = require("dotty");
const assert = require("assert");
const debug = require('debug')('imdi-dataset:db');
const QueryDimension = require("./lib/QueryDimension");

const YEAR_REGEX = /^\d{4}$/

function isYear(str) {
  return YEAR_REGEX.test(str)
}

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }
  getAllPossibleTimes() {
    return Promise.resolve(Object.keys(this._tree).reduce((acc, table)=> {
      acc[table] = Object.keys(this._tree[table]).filter(isYear).sort();
      return acc;
    }, {}));
  }

  getAllPossibleTimesForTable(table) {
    return Promise.resolve(Object.keys(this._tree[table]).filter(isYear).sort());
  }

  query(q) {

    debug("QUERY", q)
    let parsedDimensions = q.dimensions;

    if (typeof parsedDimensions === 'string') {
      debug("PARSED", parsedDimensions)
      parsedDimensions = parsedDimensions.split(";");
    }

    if (Array.isArray(parsedDimensions)) {
      parsedDimensions = parsedDimensions.map(d => {
        return (typeof d === 'string') ? QueryDimension.parse(d) : d;
      });
    }

    debug("Parsed dimensions: ", parsedDimensions)

    const root = this._tree[q.table];
    debug("Query: ", q);

    const subtree = q.time.reduce((subtree, time) => {
      if (!(time in root)) {
        debug ("Time series %s is not in root %o:" , time, root)
        return subtree;
      }
      subtree[time] = pick(root[time], q.regions);
      return subtree;
    }, {});

    debug("Prepared query subtree: ", subtree);
    const data = reduceKV(subtree, (data, {key, value}, path, tree) => {

      const isLeaf = typeof value !== 'object' && value !== null && value !== undefined;

      if (!isLeaf) {
        return data;
      }

      const [year, region, ...rest] = path;
      debug("Peeking at leaf node on path: %o", path);
      const unit = rest.pop();

      const pairwisePath = chunk(rest, 2);

      const targetPath = [region];

      // Todo: get rid of the code duplication below

      const matchesAll = parsedDimensions.every(dim => {
        const {label, include, exclude} = dim;
        const matchAny = dim.any || (!include && !exclude)
        return pairwisePath.some(pair => {
          if (pair[0] !== label) {
            return false;
          }
          if (include && include.includes(pair[1])) {
            return true;
          }
          if (exclude && exclude.includes(pair[1])) {
            return false;
          }
          return matchAny;
        });
      });

      if (!matchesAll) {
        debug("Doesnt match all dimensions %o, %o", parsedDimensions, path)
        return data;
      }

      const foundDimensions = parsedDimensions.map(dim => {
        const {label, include, exclude} = dim;
        const matchAny = dim.any || (!include && !exclude)

        const foundPair = pairwisePath.find(pair => {
          if (pair[0] !== label) {
            return false;
          }
          if (include && include.includes(pair[1])) {
            return true;
          }
          if (exclude && exclude.includes(pair[1])) {
            return false;
          }
          return matchAny;
        });
        const foundVariable = foundPair && foundPair[1];
        return foundPair && foundVariable && [dim.label, foundVariable];
      });

      foundDimensions.forEach(dim => {
        targetPath.push(dim[0], dim[1]);
      });

      targetPath.push(unit);

      debug("Writing leaf node to target path: ", targetPath);

      const current = dotty.get(data, targetPath) || [];
      current[q.time.indexOf(year)] = value;

      dotty.put(data, targetPath, current);

      return data;

    }, {});

    return Promise.resolve({
      time: q.time,
      table: q.table,
      data: data
    });
  }
}
