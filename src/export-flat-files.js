
const tree = require('../out/tree.json');
const fs = require('fs');
const json2csv = require('json2csv');
const debug = require('debug')('imdi-dataset:export-flat-files');

// name - year - region - keys - leaves as data


const isValidNode = function(node) {
  return !Array.isArray(node) && typeof node === 'object' && typeof node !== undefined
}

const skipKeys = ["kommunenr-kommunenavn", "naringsregionnavnnavn", "naringsregion_navn", "fylke_navn", "naringsregionnr-naringsregionnavn", "N�ringsreg", "kommune_navn", "Fylkenr-fylkenavn", "bydel_navn", "bydel_nr", "kommune_nr", "fylke_nr", "naringsgregion_nr", "naringsregion_nr", "n�ringsregion_nr", "naringsgregion_nr-naringsregionnavn", "naringsgregionnavn", "kommune_nr-kommunenavn", "kommunenavn"];
const administrativeKeyNames = {
	"K": "kommune_nr",
	"N": "naringsregion_nr",
	"F" : "fylke_nr",
	"B" : "bydel_nr"
}

const parsePath = function(path) {
	let year = path.shift();
	let adminUnit = path.shift();
	let adminUnitKeyName = administrativeKeyNames[adminUnit[0]];
	let adminUnitCode = adminUnit.substring(1);

	let resultHash = {
		aar: year,
	}
	resultHash[adminUnitKeyName] = adminUnitCode;
	for (let i = 0; i < path.length / 2; i++) {
		resultHash[path[i*2]] = path[(i*2)+1];
	}
	return resultHash
}


const treeToArray = function(val,path) {
	if (path === undefined) path = [];
  var result = [];
  var keys = Object.keys(val);

  // So we may assume all leaves are simply
  keys = keys.filter((e)=> {
  	return !skipKeys.includes(e);
  })

  keys.forEach((key)=> {
    var nextNode = val[key];
    if (isValidNode(nextNode)) {
    	let clonedPath = path.slice(0);
    	clonedPath.push(key);
      result = result.concat(treeToArray(nextNode, clonedPath));
    } else {
			let resultHash = parsePath(path.slice(0));
    	// debug(key, nextNode);
    	// debug(path);
			resultHash.enhet = key;
			resultHash.tabellvariabel = nextNode
			result.push(resultHash);
    };
  });
  return result;
}


const dumpTable = function(tableName, i) {
	debug("--- Dumping:",tableName, i);
	let rows = treeToArray(tree[tableName]);

	// Iterate over everything to get unique keys. Also add tableName
	let allKeys = [];
	rows.forEach((row)=>{
		row["tabell_navn"] = tableName;
		Object.keys(row).forEach((k)=>{
			if(! allKeys.includes(k) ) {
				allKeys.push(k);
			}
		});
	});

	debug("Unique keys:", allKeys);

	// Fill empty values
	rows.forEach((row)=>{
		let rowKeys = Object.keys(row);
		allKeys.forEach((k)=>{
			if(!rowKeys.includes(k) ) {
				row[k] = "NULL";
			}
		});
	});

	json2csv({data: rows, fields:allKeys}, (err, csv)=> {
		if (err) debug(err);
		fs.writeFile("export_flat/" + tableName + '.csv', csv, function(err) {
    	if (err) throw err;
    	debug('file saved');
  	});
	});
}

const getKeys = function(o) {
	return Object.keys(o);
}

// const tables = [getKeys(tree)[4]];
const tables = getKeys(tree);
tables.forEach(dumpTable);
