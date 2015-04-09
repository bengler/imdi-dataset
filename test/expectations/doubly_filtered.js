export default {
  pending: false,
  query: {
    table: "videregaende_fullfort",
    regions: ["F1"],
    dimensions: ["kjonn:1", "innvkat_5:innvandrere"],
    time: ["2011"]
  },
  result: {
    table: 'videregaende_fullfort',
    time: ['2011'],
    data: {
      "F1": {
        kjonn: {
          "1": {
            innvkat_5: {
              innvandrere: {
                personer: ["139"],
                prosent: ["39"]
              }
            }
          }
        }
      }
    }
  },
  tree: {
    "videregaende_fullfort": {
      "2011": {
        "F1": {
          "innvkat_5": {
            "alle": {
              "kjonn": {
                "0": {
                  "personer": "1226",
                  "prosent": "71,2"
                },
                "1": {
                  "personer": "1055",
                  "prosent": "61,3"
                },
                "alle": {
                  "personer": "2281",
                  "prosent": "66,3"
                }
              }
            },
            "innvandrere": {
              "kjonn": {
                "0": {
                  "personer": "371",
                  "prosent": "68,3"
                },
                "1": {
                  "personer": "139",
                  "prosent": "39"
                },
                "alle": {
                  "personer": "210",
                  "prosent": "53,9"
                }
              }
            }
          }
        }
      }
    }
  }
};
