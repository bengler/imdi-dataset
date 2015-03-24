import pick from 'lodash.pick';

const reduceKV = require("./lib/kv-reduce");
const dotty = require("dotty");
const debug = require('debug')('imdi-dataset:db');

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  query(q) {
    const {table, time, regions, dimensions} = q;


    const subtree = pick(this._tree, time);

    // Limit subtrees
    const existingTimes = time.filter(time => time in subtree);

    const data = reduceKV(subtree, (result, {key, value}, path, tree) => {

      const isLeaf = typeof value !== 'object' && value !== null && value !== undefined;

      if (!isLeaf) {
        return result;
      }

      const [time, _table, region, ...dimensions] = path;

      if (table !== table) {
        return result;
      }

      if (!regions.includes(region)) {
        return result;
      }

      debug("Leaf: %s=>%s", path.join("."), value);

      const targetPath = [region, ...dimensions];


      //console.log("TIME: ", time, value, existingTimes.indexOf(time))

      //debug("it #%s: %o", path, result);


      const current = dotty.get(result, targetPath) || [];
      current[existingTimes.indexOf(time)] = value;

      dotty.put(result, targetPath, current)

      return result;

    }, {
      time: existingTimes,
      table: table
    });

    return Promise.resolve(data);
  }
}