# IMDi Dataset

Here are import scripts for munging raw csv data exports from IMDI, plus a library that exposes a database API that can be used to query the data. 

*IMPORTANT*: All the data contained here must be [de-identificated](http://en.wikipedia.org/wiki/De-identification) before committed.

# Getting started

## Clone repo

    git clone https://github.com/bengler/imdi-dataset.git

## Install dependencies

    npm install

## Run import scripts

    npm run all

This will import both exports of single tables and historical exports (i.e. `01_test-befolkning_hovedgruppe-kommune-1986_2015.csv`) and update the file `./out/tree.json` with the munged data.

## Use as library

    npm install --save @bengler/imdi-dataset

And then from code:

```js
var db = require("@bengler/imdi-dataset");

var query = {
  table: "videregaende_fullfort",
  regions: ["F1"],
  dimensions: ["kjonn:0,1", "innvkat_5"],
  time: ["2011"]
};

db.query(query)
  .then(function(result) {
    console.log("Result", result);
  })
  .catch(function(error) {
    console.log("Something went wrong", error);
  });
  ```
