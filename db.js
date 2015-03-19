import Bluebird from "bluebird";


const example = {
  query: {
    tabell: "befolkning_hovedgruppe",
    time: "latest", // "1985", "1989-2015", ["1989","1990","1991"], "1989,1990,1991"
    dimensions: ["innvkat5", "kjonn", "enhet.person"]
  },
  result: {
    befolkning_hovedgruppe: {
      time: {
        timestamps: ['2001-01-01', '2002', '2003']
      }
      ,
      innvkat5: {
        asia: {
          kjonn: {
            "1": {
              enhet: {
                prosent: [23, 40.2, null],
                person: [, , ,]
              }
            }
          }
        }
        ,
        afrika: {}
      }
    }
  }
};

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  query(q) {
    return Promise.resolve({})
  }
}

