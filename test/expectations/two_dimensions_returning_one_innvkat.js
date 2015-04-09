export default {
  query: {
    table: "videregaende_fullfort",
    regions: ["F1"],
    dimensions: ["innvkat_5"],
    time: ["2011"]
  },
  result: {
    table: "videregaende_fullfort",
    time: ['2011'],
    data: {
      "F1": {
        innvkat_5: {
          alle: {
            personer: ["3232"],
            prosent: ["69,3"]
          },
          innvandrere: {
            personer: ["210"],
            prosent: ["53,9"]
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
                  "personer": "3232",
                  "prosent": "69,3"
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
