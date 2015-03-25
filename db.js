import pick from 'lodash.pick';

const reduceKV = require("./lib/kv-reduce");
const dotty = require("dotty");
const debug = require('debug')('imdi-dataset:db');

const YEAR_REGEX = /^\d{4}$/

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  getAllPossibleTimes() {
    return Promise.resolve(Object.keys(this._tree).filter(year => YEAR_REGEX.test(year)).sort());
  }

  query(q) {
    const {table, time, regions, dimensions} = q;

    const subtree = time.reduce((subtree, time) => {
      if (!(time in this._tree)) {
        return subtree;
      }

      if (!(table in this._tree[time])) {
        return subtree;
      }

      subtree[time] = subtree[time] || {[table]: {}};

      Object.assign(subtree[time][table], pick(this._tree[time][table], regions));

      return subtree;
    }, {});

    // Limit subtrees
    //const existingTimes = time.filter(time => time in subtree);

    //debug(subtree);
    const data = reduceKV(subtree, (result, {key, value}, path, tree) => {

      const isLeaf = typeof value !== 'object' && value !== null && value !== undefined;

      if (!isLeaf) {
        return result;
      }

      const [_time, _table, region, ..._dimensions] = path;

      if (table !== _table) {
        return result;
      }

      if (!regions.includes(region)) {
        return result;
      }

      //debug("Leaf: %s=>%s", path.join("."), value);

      const targetPath = ['data', region, ..._dimensions];

      //console.log("TIME: ", time, value, existingTimes.indexOf(time))

      //debug("it #%s: %o", path, result);


      const current = dotty.get(result, targetPath) || [];
      current[time.indexOf(_time)] = value;

      dotty.put(result, targetPath, current)

      return result;

    }, {
      time: time,
      table: table
    });

    return Promise.resolve(data);
  }
}