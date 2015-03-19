export default {
  query: {
    tabell: "befolkning_hovedgruppe",
    time: "latest", // "1985", "1989-2015", ["1989","1990","1991"], "1989,1990,1991"
    dimensions: ["innvkat5", "kjonn", "enhet.person"]
  },
  result: {
    befolkning_hovedgruppe: {
      time: {
        timestamps: ['2001-01-01', '2002', '2003']
      },
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
        },
        afrika: {}
      }
    }
  },
  tree: {
    "1986": {
      "befolkning_hovedgruppe": {
        "kommune": {
          "102": {
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
          "103": {
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
  }
};