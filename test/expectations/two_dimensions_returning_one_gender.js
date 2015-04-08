export default {
  pending: true,
  query: {
    table: "videregaende_fullfort",
    regions: ["F1"],
    dimensions: ["kjonn"],
    time: ["2011"]
  },
  result: {
    table: "videregaende_fullfort",
    time: ['2011'],
    data: {
      "F1": {
        kjonn: {
          "0": {
            "personer": ["1226"],
            "prosent": ["71,2"]
          },
          "1": {
            "personer": ["1055"],
            "prosent": ["61,3"]
          },
          "alle": {
            "personer": ["3232"],
            "prosent": ["69,3"]
          }
        }
      }
    }
  },
  tree: {
    "2011": {
      "videregaende_fullfort": {
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
