import fs from 'fs';
import Rx from 'rx';
import path from 'path';
import csv from 'csv-parse';

const debug = require('debug')('imdi-dataset:parser');

const SOURCE_DIR = path.join(__dirname, 'import', 'leveranse-2-fra-imdi');
const OUTPUT_DIR = path.join(__dirname, 'out');

const readdir = Rx.Observable.fromNodeCallback(fs.readdir);

const files = readdir(SOURCE_DIR)
  .flatMap(files => Rx.Observable.from(files))
  .map(file => path.join(SOURCE_DIR, file));

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

          const lastHeaderRow = headerRow.pop();
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
            .toArray()
            .map(remainingRows => {
              return Object.assign({}, dataset, {
                rows: remainingRows
              });
            })
        });
    })
  ;

const jsonLines = datasets
  .tap(dataset => debug("%s: (%d rows)",
    dataset.basename,
    dataset.rows.length
  ))
  .map(dataset => JSON.stringify(dataset) + '\n');

jsonLines.pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'datasets.json')));

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

  const [tableNo, tableName, area, year]  = path.basename(fullPath, path.extname(fullPath)).split("-");
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
