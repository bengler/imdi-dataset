import uniq from 'lodash.uniq';

function compact(o) {
  return Object.keys(o).reduce((acc, key) => {
    const val = o[key];
    if (!val || (Array.isArray(val) && val.length == 0)) {
      return acc;
    }
    acc[key] = val;
    return acc;
  }, {})
}

function trim(str) {
  return str ? str.trim() : str
}

function not(fn) {
  return (...args) => !fn(...args)
}
function startsWith(char) {
  return str => str[0] === char
}
function is(char) {
  return str => str === char
}

export function parse(dimension) {
  const [label, _variables] = dimension.trim().split(":").map(trim).filter(Boolean);

  const variables = uniq((_variables || "").split(",").map(trim).filter(Boolean));

  const shouldExclude = startsWith('-');
  const shouldInclude = not(shouldExclude);
  const isWildcard = is('*');

  const include = variables.filter(not(isWildcard)).filter(shouldInclude);
  const exclude = variables.filter(not(isWildcard)).filter(shouldExclude).map(v => v.substring(1));
  const any = (include.length === 0 && exclude.length === 0) || variables.some(isWildcard);

  // Sanity check
  const allVars = include.concat(exclude).sort();
  allVars.forEach((v, i) => {
    if (v === allVars[i + 1]) {
      throw new Error(`Variable ${v} is both included and excluded in "${dimension}". It is unclear what to do.`)
    }
  });

  return compact({label, include, exclude, any});
}

export function stringify(dim) {

  const vars = [];
  if (dim.any && (dim.include || dim.exclude)) {
    vars.push("*");
  }

  if (dim.include) {
    vars.push(...dim.include);
  }
  if (dim.exclude) {
    vars.push(...(dim.exclude).map(v => "-"+v));
  }

  return dim.label + (vars.length ? ":"+vars.join(",") : '');
}
