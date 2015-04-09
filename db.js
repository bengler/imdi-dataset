import pick from 'lodash.pick';
const reduceKV = require("./lib/kv-reduce");
const chunk = require("lodash.chunk");
const dotty = require("dotty");
const debug = require('debug')('imdi-dataset:db');
const expandQueryDimension = require("./lib/expandQueryDimension");

const YEAR_REGEX = /^\d{4}$/



export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  getAllPossibleTimes() {
    return Promise.resolve(Object.keys(this._tree).filter(year => YEAR_REGEX.test(year)).sort());
  }

  query(q) {

    const parsedDimensions = q.dimensions.map(expandQueryDimension);

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
    const data = reduceKV(subtree, (result, {key, value}, path, tree) => {

      const isLeaf = typeof value !== 'object' && value !== null && value !== undefined;

      if (!isLeaf) {
        return result;
      }

      const [year, region, ...rest] = path;
      debug("Peeking at leaf node on path: %o", path);
      const unit = rest.pop();

      const pairwisePath = chunk(rest, 2);

      const targetPath = ['data', region];

      // Todo: get rid of the code duplication below

      const matchesAll = parsedDimensions.every(dim => {
        return pairwisePath.some(pair => {
          return pair[0] == dim.label && (
              dim.include.some(_var => _var == pair[1]) ||
              (dim.all && !dim.exclude.some(_var => _var == pair[1])
            )
          );
        });
      });

      if (!matchesAll) {
        return result;
      }

      const foundDimensions = parsedDimensions.map(dim => {
        const foundPair = pairwisePath.find(pair => {
          return pair[0] == dim.label && (
              dim.include.some(_var => _var == pair[1]) ||
              (dim.all && !dim.exclude.some(_var => _var == pair[1])
            )
          );
        });
        const foundVariable = foundPair && foundPair[1];
        return foundPair && foundVariable && [dim.label, foundVariable];
      });

      foundDimensions.forEach(dim => {
        targetPath.push(dim[0], dim[1]);
      });

      targetPath.push(unit);

      debug("Writing leaf node to target path: ", targetPath);

      const current = dotty.get(result, targetPath) || [];
      current[q.time.indexOf(year)] = value;

      dotty.put(result, targetPath, current);

      return result;

    }, {
      time: q.time,
      table: q.table
    });

    return Promise.resolve(data);
  }
}
