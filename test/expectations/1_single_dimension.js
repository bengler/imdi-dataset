export default {
  query: {
    table: "befolkning_hovedgruppe",
    regions: ["K0102"],
    dimensions: ["innvkat5"],
    time: ["1986"] // "1985", "1989-2015", ["1989","1990","1991"], "1989,1990,1991"
  },
  result: {
    befolkning_hovedgruppe: {
      time: ['1986'],
      data: {
        "K0102": {
          innvkat5: {
            alle: {
              prosent: ["10"],
              person: ["568"]
            },
            innvandrere: {
              prosent: ["11"],
              person: ["73"]
            },
            befolkningen_ellers: {
              prosent: ["12"],
              person: ["5711"]
            },
            norskfodte_m_innvf: {
              prosent: ["13"],
              person: ["72"]
            },
            bef_u_innv_og_norskf: {
              prosent: ["13"],
              person: ["9392"]
            }
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
              "enhet": {
                "personer": "568"
              }
            },
            "innvandrere": {
              "enhet": {
                "personer": "73"
              }
            },
            "befolkningen_ellers": {
              "enhet": {
                "personer": "5711"
              }
            },
            "norskfodte_m_innvf": {
              "enhet": {
                "personer": "72"
              }
            },
            "bef_u_innv_og_norskf": {
              "enhet": {
                "personer": "9392"
              }
            }
          }
        },
        "K0103": {
          "innvkat_5": {
            "alle": {
              "enhet": {
                "personer": "94893"
              }
            },
            "innvandrere": {
              "enhet": {
                "personer": "913"
              }
            },
            "befolkningen_ellers": {
              "enhet": {
                "personer": "34562"
              }
            },
            "norskfodte_m_innvf": {
              "enhet": {
                "personer": "342"
              }
            },
            "bef_u_innv_og_norskf": {
              "enhet": {
                "personer": "709382"
              }
            }
          }
        }
      }
    }
  }
};
