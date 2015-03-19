import Bluebird from "bluebird";

export default class DB {

  constructor(tree) {
    this._tree = tree;
  }

  query(q) {
    return Promise.resolve({
      befolkning_hovedgruppe: {
        time: {
          timestamps: ['2001-01-01', 2002, 2003]
        },
        innvkat5: {
          asia: {
            kjonn: {
              "1": {
                enhet: {
                  prosent: [23.5, 40.2, null],
                  person: [,,,]
                }
              }
            }
          },
          afrika: {}
        }
      }
    })
  }
}

