import fs from 'fs';
import Rx from 'rx';
import path from 'path';
import csv from 'csv-parse';
import assert from 'assert';

const debug = require('debug')('imdi-dataset:parser');

const SOURCE_DIRS = [
  path.join(__dirname, 'import', 'historisk per 150407')
];

const OUTPUT_DIR = path.join(__dirname, 'tmp');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'historical.json');


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
      const readRows = readFileContents(dataset.path);

      let prevRow;
      const headerRows = readRows.takeWhile(row => {
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
        .map(r => r.filter(Boolean))
        .toArray()
        .flatMap(headerRows => {
          return readRows
            .map(row => {
              return row.reduce((obj, cellValue, i) => {
                obj[headerRows[i].join("/")] = cellValue;
                return obj;
              }, {});
            })
            .map(transformRow(dataset))
            .toArray()
            .map(remainingRows => {
              return Object.assign({}, dataset, {
                rows: remainingRows
              });
            })
        });
    })
    .tap(dataset => debug("%s: (%d rows)",
      dataset.basename,
      dataset.rows.length
    ))
    .flatMap(dataset => dataset.rows)
    .reduce((acc, row)=> {

      // Assert no duplicate keys
      Object.keys(row).forEach(key => assert(!(key in acc), `Duplicate key: ${key}`));

      return Object.assign(acc, row)
    }, {})
  ;

const jsonLines = datasets
  .map(dataset => JSON.stringify(dataset) + '\n');

jsonLines.pipe(fs.createWriteStream(OUTPUT_FILE));

function readFileContents(path) {
  return Rx.Node.fromReadableStream(
    fs.createReadStream(path)
      .pipe(csv({
        delimiter: ';'
      }))
  )
    .map(row => row.map(cell => cell.trim()));
}


const ROW_TRANSFORMERS = {
  kommune(row, dataset) {

    //debug(row[''])
    const {number: municpalityNumber, name, period} = splitRowMeta(row[""]);
    return Object.keys(row)
      .filter(Boolean)
      .reduce((newRow, key) => {

        const [, year, rest] = key.match(/^ar\.(\d+)\/?(.+)?$/);
        const tail = rest.split("/")

        if (period.to && Number(year) > Number(period.to)){
          assert(row[key] === "0", `Didn't expect values after ${period.to} for municipality ${name} (${municpalityNumber}) to have values`);
          return newRow;
        }
        const newKey = [dataset.tableName, year, 'K'+municpalityNumber, ...tail].join(".");
        newRow[newKey] = row[key];
        return newRow;
      }, {});

    function splitRowMeta(columnHeader) {
      const NAME_RE = /^(\d+)\s(.*)\s*/;
      const PERIOD_RE = /\s+\((\d*-\d+)\)$/;

      const periodsMatch = columnHeader.match(PERIOD_RE);
      const [from, to] = (periodsMatch ? periodsMatch[1] : '-').split("-");
      const [, number, name] = NAME_RE.exec(periodsMatch ? columnHeader.split(PERIOD_RE)[0] : columnHeader);
      return {number, name, period: {from, to}}
    }
  }
};

function transformRow(dataset) {
  return function transformRow(row) {
    const {regionType} = dataset;
    return ROW_TRANSFORMERS[regionType](row, dataset)
  }
}

function createDatasetFromFilename(fullPath) {
  const basename = path.basename(fullPath);
  const extname = path.extname(basename);

  const [tableNo, tableName, regionType, years]  = path.basename(basename, extname)
    // some files are suffixed with a version (e.g. _v2) that we ignore
    .replace(/v\d+$/, '')
    .split("-");

  const [from, to] = years.split("_");

  return {
    basename: basename,
    path: fullPath,
    range: {
      from,
      to
    },
    tableNo,
    tableName: tableName+'_tidsserie',
    regionType
  }
}

function normalizeHeaderNames(headerNames) {
  return headerNames.map(label => label.replace("/", "$").trim().replace(/\n|\r/g, ''));
}
