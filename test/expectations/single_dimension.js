export default {
  query: {
    table: "befolkning_hovedgruppe",
    regions: ["K0102"],
    dimensions: ["innvkat_5"],
    time: ["1986"] // "1985", "1989-2015", ["1989","1990","1991"], "1989,1990,1991"
  },
  result: {
    table: 'befolkning_hovedgruppe',
    time: ['1986'],
    data: {
      "K0102": {
        innvkat_5: {
          alle: {
            prosent: ["10"],
            personer: ["568"]
          },
          innvandrere: {
            prosent: ["11"],
            personer: ["73"]
          },
          befolkningen_ellers: {
            prosent: ["12"],
            personer: ["5711"]
          },
          norskfodte_m_innvf: {
            prosent: ["13"],
            personer: ["72"]
          },
          bef_u_innv_og_norskf: {
            prosent: ["14"],
            personer: ["9392"]
          }
        }
      }
    }
  },
  tree: {
    "1986": {
      "befolkning_hovedgruppe": {
        "K0102": {
          "innvkat_5": {
            "alle": {
              "prosent": "10",
              "personer": "568"
            },
            "innvandrere": {
              "prosent": "11",
              "personer": "73"
            },
            "befolkningen_ellers": {
              "prosent": "12",
              "personer": "5711"
            },
            "norskfodte_m_innvf": {
              "prosent": "13",
              "personer": "72"
            },
            "bef_u_innv_og_norskf": {
              "prosent": "14",
              "personer": "9392"
            }
          }
        },
        "K0103": {
          "innvkat_5": {
            "alle": {
              "personer": "94893"
            },
            "innvandrere": {
              "personer": "913"
            },
            "befolkningen_ellers": {
              "personer": "34562"
            }
          },
          "norskfodte_m_innvf": {
            "personer": "342"
          },
          "bef_u_innv_og_norskf": {
            "personer": "709382"
          }
        }
      }
    }
  }
};
