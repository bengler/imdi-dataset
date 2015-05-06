import Rx from 'rx';
import path from 'path';
import fs from 'fs';
import split from 'split';

const debug = require('debug')('imdi-dataset:make-tree');
const unflatten = require('flat').unflatten;
const writeFile = Rx.Observable.fromNodeCallback(fs.writeFile);

const SOURCE_FILES = [
  path.join(__dirname, '..', 'tmp', 'datasets.json'),
  path.join(__dirname, '..', 'tmp', 'historical.json')
];

const OUT_FILE = path.join(__dirname, '..', 'out', 'tree.json');

const lines = Rx.Observable.from(SOURCE_FILES).flatMap(sourceFile => {
  debug(sourceFile)
  return Rx.Node.fromReadableStream(
    // splitting could probably be done using rx too, but too lazy to find out how rn
    fs.createReadStream(sourceFile, 'utf-8').pipe(split('\n'))
  );
});

const datasets = lines.filter(Boolean).map(JSON.parse);

datasets
  .reduce((acc, dataset) => {
    return Object.assign(acc, dataset)
  }, {})
  .tap(merged => debug("Unflattening %d keys by '.'", Object.keys(merged).length))
  .map(merged => unflatten(merged, {object: true, delimiter: '.'}))
  .tap(s => debug("Stringifying the whole thing..."))
  .map(s => JSON.stringify(s, null, 2))
  .tap(s => debug("Writing to %s", OUT_FILE))
  .flatMap(json => writeFile(OUT_FILE, json, 'utf-8'))
  .subscribe(()=> {
    debug("Done!")
  })
;
