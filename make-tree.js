import Rx from 'rx';
import path from 'path';
import fs from 'fs';
import split from 'split';

const debug = require('debug')('imdi-dataset:make-tree');
const unflatten = require('flat').unflatten;
const writeFile = Rx.Observable.fromNodeCallback(fs.writeFile);

const SOURCE_JSON = path.join(__dirname, 'out', 'datasets.json');
const OUT_FILE = path.join(__dirname, 'out', 'mapped.json');

// A few discrepancies in source files
const AREA_NUMBER_ALIASES = {
  'naringsregion': [
    'naringsgregion_nr',
    'n�ringsregion_nr'
  ]
};

const lines = Rx.Node.fromReadableStream(
  // splitting could probably be done using rx too, but too lazy to find out how rn
  fs.createReadStream(SOURCE_JSON, 'utf-8').pipe(split('\n'))
);

const datasets = lines.filter(Boolean).map(JSON.parse);

datasets
  .tap(dataset => debug("Mapping %s entries from dataset %s, %s, %s", dataset.rows.length, dataset.tableName, dataset.area, dataset.year))
  .toArray()
  .map(datasets => {
    const values = {};
    datasets.forEach(dataset => {
      const {rows, tableName, area, year} = dataset;
      const basePath = [year, tableName, area];
      rows.forEach(row => {

        let areaNumberKey = `${area}_nr`;
        if (!(areaNumberKey in row)) {
          areaNumberKey = AREA_NUMBER_ALIASES[area].find(alias => alias in row);
          if (!areaNumberKey) {
            throw new Error(`Could not map area number of row ${JSON.stringify(row)}`)
          }
        }

        const areaNo = row[areaNumberKey];

        const rowPath = basePath.concat([areaNo]);
        values[rowPath.join("/")] = row;
      });
    });
    return values
  }
)
  .tap(s => debug("Unflattening keys... '/'"))
  .map(struct => unflatten(struct, {object: true, delimiter: '/'}))
  .tap(s => debug("Unflattening keys... '.'"))
  .map(struct => unflatten(struct, {object: true, delimiter: '.'}))
  .tap(s => debug("Stringifying..."))
  .map(s => JSON.stringify(s, null, 2))
  .tap(s => debug("Writing to %s", OUT_FILE))
  .flatMap(json => writeFile(OUT_FILE, json, 'utf-8'))
  .subscribe(()=> {
    debug("Done!")
  })
;
