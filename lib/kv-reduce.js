/*
//example:
const object = {
  key: 'value',
  nested: {
    foo: 'bar',
    even: {deeper: 'yes'}
  },
  other: "hey"
};

const reduced = reduceKV(object, [], (acc, {key, value}, path, root)=> {
  return acc.concat({key, value, path})
});

console.log(JSON.stringify(reduced, null, 2));
 */

export default function reduceKV(data, reducer, initial, _path = [], _root = initial) {
  return Object.keys(data).reduce((acc, key) => {
    const path = _path.concat(key);
    const value = data[key];

    const reduced = reducer(acc, {key, value}, path, _root);

    if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
      return reduceKV(data[key], reducer, reduced, path, _root)
    }

    return reduced;

  }, initial);
}
