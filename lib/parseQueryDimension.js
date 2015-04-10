import uniq from 'lodash.uniq';

function compact(o) {
  return Object.keys(o).reduce((acc, key) => {
    if (Array.isArray(o[key]) && o[key].length == 0) {
      return acc;
    }
    acc[key] = o[key];
    return acc;
  }, {})
}

export default function parseQueryDimension(dim) {
  const [label, _variables] = dim.split(":").filter(v => v.trim());

  const variables = uniq((_variables||"").split(",").filter(v => v.trim()));

  const include = variables.filter(v => v !== '*').filter(v => v[0] !== "-");
  const exclude = variables.filter(v => v[0] === "-").map(v => v.substring(1));
  const all = (include.length === 0 && exclude.length === 0) || variables.some(v => v === '*');

  // Sanity check
  const allVars = include.concat(exclude).sort();
  allVars.forEach((v, i) => {
    if (v === allVars[i+1]) {
      throw new Error(`Variable ${v} is both included and excluded in "${dim}". It is unclear what to do.`)
    }
  });

  return compact({label, include, exclude, all});
}
