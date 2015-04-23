import fs from 'fs';
import Rx from 'rx';
import path from 'path';
import csv from 'csv-parse';
import assert from 'assert';

const debug = require('debug')('imdi-dataset:parser');

const SOURCE_DIRS = [
  path.join(__dirname, 'import', 'files')
];

const OUTPUT_DIR = path.join(__dirname, 'tmp');

// A few discrepancies in source files
const REGION_NUMBER_ALIASES = {
  naringsregion: [
    'naringsgregion_nr',
    'n�ringsregion_nr'
  ],
  kommune: [
    'kommune_nr'
  ]
};

function padleft(str, len, padchar=" ") {
  while (str.length < len) {
    str = `${padchar}${str}`;
  }
  return str;
}

const REGION_NORMALIZERS = {
  naringsregion: (n) => `N${padleft(n, 2, '0')}`,
  kommune: (n) => `K${padleft(n, 4, '0')}`,
  fylke: (n) => `F${padleft(n, 2, '0')}`,
  bydel: (n) => `B${padleft(n, 6, '0')}`
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

      const {rows, tableName, regionType, year} = dataset;

      return rows.map(entry => {

        let regionNumberKey = `${regionType}_nr`;
        if (!(regionNumberKey in entry)) {
          assert(regionType in REGION_NUMBER_ALIASES, `Expected REGION_NUMBER_ALIASES.${regionType} to be an array that includes ${regionNumberKey}`)
          regionNumberKey = REGION_NUMBER_ALIASES[regionType].find(alias => alias in entry);
        }

        assert(regionNumberKey !== '', `Unable to resolve region number key for entry ${JSON.stringify(entry)}`)

        //debug("Region number key: %s", regionNumberKey)

        const regionNo = entry[regionNumberKey];

        if (!regionNo) {
          debug(
            `warning: %s: Expected region entry number property "%s" to be a property of %o.
            Skipping.`,
            dataset.basename,
            regionNumberKey,
            entry
          );
          return null;
        }

        return Object.keys(entry)
          .filter(Boolean)
          .reduce((transformedRow, key) => {
            const tail = key.split(".");

            const normalizedNo = REGION_NORMALIZERS[regionType](regionNo);
            const newKey = [tableName, year, normalizedNo, ...tail].join(".");
            //debug("%s# %s => %s", "", key, newKey)
            transformedRow[newKey] = entry[key].replace(",", ".");
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

  const [tableNo, tableName, regionType, year]  = path.basename(basename, extname)
    // some files are suffixed with a version (e.g. _v2) that we ignore
    .replace(/_v\d+$/, '')
    .split("-");

  return {
    basename: basename,
    path: fullPath,
    tableNo,
    tableName,
    regionType,
    year
  }
}

function normalizeHeaderNames(headerNames) {
  return headerNames.map(label => label.replace("/", "$").trim().replace(/\n|\r/g, ''));
}
