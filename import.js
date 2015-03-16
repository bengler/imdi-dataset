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

function normalizeHeaderNames(header) {
  return header.map(label => label.replace("/", "$").trim().replace(/\n|\r/g, ''));
}

const datasets = files.map(createDatasetFromFilename)
  .flatMap(dataset => {
    const readRows = readFileContents(dataset.path);
    let prevRow;
    const headers = readRows.takeWhile(row => {
      if (!prevRow) {
        prevRow = row;
        return true;
      }
      const isLastHeaderRow = prevRow.some(cell => cell.includes('enhet'));
      prevRow = row;
      return !isLastHeaderRow;
    });

    return headers.map(normalizeHeaderNames)
      .toArray()
      .flatMap(headerRows => {

        if (headerRows.length === 1) return headerRows;

        const lastHeaderRow = headerRows.pop();
        return lastHeaderRow.map((col, colIdx) => {
          return [...(headerRows.map(row => row[colIdx])), col];
        });
      })
      .toArray()
      .flatMap(headerRows => {
        return readRows.toArray().map(remainingRows => {
          return Object.assign({}, dataset, {
            headers: headerRows,
            rows: remainingRows
          });
        })
      })
  });

function sanityCheckDataset(dataset) {
  const {headers, rows} = dataset;
  if (rows.some((row, i) => row.length !== headers.length)) {
    debug("WARNING: Row %d of dataset %s has more elements than there are header columns", i, dataset.basename);
  }
}

datasets
  .tap(sanityCheckDataset)
  .tap(dataset => debug("%s: (%d rows)\n\tHeaders: %o\n\tFirst data row: %o\n", dataset.basename, dataset.rows.length, dataset.headers.map(h => h.join("/")), dataset.rows[0]))
  .toArray()
  .subscribe(datasets => {
    fs.writeFile(path.join(OUTPUT_DIR, 'test.json'), JSON.stringify(datasets, null, 2));
  })