import Bluebird from "bluebird";

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  query(q) {

    const free = new Set(path);

    let cursor = this._tree;
    while (free.size > 0) {
      const next = [...free].find(freestep => freestep in cursor);
      if (!next) {
        return Bluebird.reject(new Error(`Invalid next step ${step}`))
      }
      if (next) {
        cursor = cursor[next];
      }
      free.delete(next);
    }
    return Bluebird.resolve(cursor);
  }
}

