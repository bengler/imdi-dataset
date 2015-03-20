import fs from 'fs';
import Rx from 'rx';
import path from 'path';
import csv from 'csv-parse';
import assert from 'assert';

const debug = require('debug')('imdi-dataset:parser');

const SOURCE_DIRS = [
  path.join(__dirname, 'import', 'leveranse-2-fra-imdi'),
  path.join(__dirname, 'import', 'leveranse-3-fra-imdi')
];

const OUTPUT_DIR = path.join(__dirname, 'out');

// A few discrepancies in source files
const AREA_NUMBER_ALIASES = {
  'naringsregion': [
    'naringsgregion_nr',
    'n�ringsregion_nr'
  ]
};

const AREA_PREFIX_MAP = {
  naringsregion: 'N',
  kommune: 'K',
  fylke: 'F',
  bydel: 'B',
};

const BLACKLISTED_HEADERS = [
  "Bydel nr & navn",
  "Bydel\nnavn",
  "Nedbrytninger",
  "",
  "Fylke nr & navn",
  "Fylkenavn",
  "Fylke\nnavn",
  "N�ringsregion \nnr & navn",
  "N�ringsregion\nnavn",
  "N�ringsreg",
  "N�ringsregionnavn",
  "Kommune nr & navn",
  "Kommunenavn",
  "Kommune\nnavn",
  "Alder",
  "Kj�nn",
  "Bydel nr",
  "Bydel.\nnavn",
  "Todelt verdensregion",
  "Fylke. nr",
  "Fylke.\nnavn",
  "N�ringsreg nr",
  "N�ringsreg.\nnavn",
  "Type tall",
  "Innvkat og v-reg",
  "Prosent",
  "Nr & navn",
  "Bydelsnavn",
  "N�ringsregion nr & navn",
  "N�ringsregionsavn",
  "Bydelnavn",
  "N�ringsregion navn",
  "Kmmune\nnavn",
  "Navn",
  "Bydels nr & navn",
  "Bydels navn",
  "N�ringsregion-navn",
  "Fylke",
  "Bydel",
  "Naringsgregion",
  "Innvkat og kj�nn"
];

const readdir = Rx.Observable.fromNodeCallback(fs.readdir);

const files = Rx.Observable.from(SOURCE_DIRS)
  .flatMap(dir => {
    return readdir(dir)
      .flatMap(files => Rx.Observable.from(files))
      .map(file => path.join(dir, file))
  });

const datasets = files
    .map(createDatasetFromFilename)
    .flatMap(dataset => {
      const rows = readFileContents(dataset.path);

      let prevRow;
      const headerRows = rows.takeWhile(row => {
        if (!prevRow) {
          prevRow = row;
          return true;
        }
        const isLastHeaderRow = prevRow.some(cell => cell.includes('enhet'));
        prevRow = row;
        return !isLastHeaderRow;
      });

      return headerRows
        .map(normalizeHeaderNames)
        .toArray()
        .flatMap(headerRow => {

          if (headerRow.length === 1) return headerRow;

          const lastHeaderRow = headerRow.pop().map(cell => cell.replace(/^enhet\./, ''));
          return lastHeaderRow.map((col, colIdx) => {
            return [...(headerRow.map(row => row[colIdx])), col];
          });
        })
        .map(headerRow => headerRow.filter(Boolean))
        .toArray()
        .flatMap(headerRows => {
          return rows
            // Trim empty lines, i.e. ;;;;;;;;;;; or lines that contains only dotted values i.e. ;;;;;;.;.;;;; or ;;;;;;:;:;;;;
            .filter(row => {
              return row.map(cell => cell.trim())
                .filter(Boolean)
                .some(cell => cell !== '.' && cell !== ':' )
            })
            .map(row => {
              return row.reduce((obj, cellValue, i) => {

                const headers = headerRows[i];
                if (headers.some(name => BLACKLISTED_HEADERS.includes(name))) {
                  return obj;
                }

                const key = headers.join(".");

                obj[key] = cellValue;
                return obj;
              }, {});
            })
            .toArray()
            .map(remainingRows => {
              return Object.assign({}, dataset, {
                rows: remainingRows
              });
            })
        });
    })
    .tap(dataset => debug("%s %s: (%d rows)",
      dataset.basename,
      dataset.year,
      dataset.rows.length
    ))
    .flatMap(dataset => {

      const {rows, tableName, area, year} = dataset;

      return rows.map(entry => {

        let areaNumberKey = `${area}_nr`;
        if (!(areaNumberKey in entry)) {
          areaNumberKey = AREA_NUMBER_ALIASES[area].find(alias => alias in entry);
        }

        assert(areaNumberKey !== '', `Unable to resolve area number key for entry ${JSON.stringify(entry)}`)

        //debug("Area number key: %s", areaNumberKey)

        const areaNo = entry[areaNumberKey];

        if (!areaNo) {
          debug(
            `warning: %s: Expected area entry number property "%s" to be a property of %o.
            Skipping.`,
            dataset.basename,
            areaNumberKey,
            entry
          );
          return null;
        }

        return Object.keys(entry)
          .filter(Boolean)
          .reduce((transformedRow, key) => {
            const tail = key.split(".");

            const areaPrefix = AREA_PREFIX_MAP[area];
            const newKey = [year, tableName, areaPrefix+areaNo, ...tail].join(".");
            debug("%s# %s => %s", dataset.basename, key, newKey)
            transformedRow[newKey] = entry[key];
            return transformedRow;
          }, {});
      })
        .filter(Boolean);
    })
    // Collect all into same array
    .reduce((acc, row)=> {

      // Assert no duplicate keys
      Object.keys(row).forEach(key => {
        const exists = (key in acc);
        const existingVal = exists && acc[key];
        const thisVal = row[key];
        assert(!exists || existingVal == thisVal, `Found two keys with different values: ${key}: existing value ${existingVal}, this value: ${thisVal}`);
      });

      return Object.assign(acc, row);
    }, {})
//.tap(obj => debug(Object.keys(obj).length))
  ;

const jsonLines = datasets
  .map(dataset => JSON.stringify(dataset )+ '\n');

jsonLines
  .pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'datasets.json')));

function readFileContents(path) {
  return Rx.Node.fromReadableStream(
    fs.createReadStream(path)
      .pipe(csv({
        delimiter: ';'
      }))
  )
    .map(row => row.map(cell => cell.trim()));
}

function createDatasetFromFilename(fullPath) {
  const basename = path.basename(fullPath);
  const extname = path.extname(basename);

  const [tableNo, tableName, area, year]  = path.basename(basename, extname)
    // some files are suffixed with a version (e.g. _v2) that we ignore
    .replace(/_v\d+$/, '')
    .split("-");

  return {
    basename: basename,
    path: fullPath,
    tableNo,
    tableName,
    area,
    year
  }
}

function normalizeHeaderNames(headerNames) {
  return headerNames.map(label => label.replace("/", "$").trim().replace(/\n|\r/g, ''));
}
