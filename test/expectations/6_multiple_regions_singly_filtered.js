export default {
  query: {
    table: "videregaende_fullfort",
    regions: ["F1", "F2"],
    dimensions: ["kjonn.1", "innvkat_5"],
    time: ["2011"]
  },
  result: {
    befolkning_hovedgruppe: {
      time: ['2011'],
      data: {
        "F1": {
          kjonn: {
            "1": {
              innvkat5: {
                alle: {
                  personer: ["1055"],
                  prosent: ["61.3"]
                },
                innvandrere: {
                  personer: ["139"],
                  prosent: ["39"]
                }
              }
            }
          }
        },
        "F2": {
          kjonn: {
            "1": {
              innvkat5: {
                alle: {
                  personer: ["1055"],
                  prosent: ["61.3"]
                },
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
      "2011": {
        "videregaende_fullfort": {
          "F1": {
            "fylke_nr": "1",
            "innvkat_5": {
              "alle": {
                "kjonn": {
                  "0": {
                    "enhet": {
                      "personer": "1226",
                      "prosent": "71,2"
                    }
                  },
                  "1": {
                    "enhet": {
                      "personer": "1055",
                      "prosent": "61,3"
                    }
                  },
                  "alle": {
                    "enhet": {
                      "personer": "2281",
                      "prosent": "66,3"
                    }
                  }
                }
              },
              "innvandrere": {
                "kjonn": {
                  "0": {
                    "enhet": {
                      "personer": "371",
                      "prosent": "68,3"
                    }
                  },
                  "1": {
                    "enhet": {
                      "personer": "139",
                      "prosent": "39"
                    }
                  },
                  "alle": {
                    "enhet": {
                      "personer": "210",
                      "prosent": "53,9"
                    }
                  }
                }
              }
            }
          },
          "F2": {
            "fylke_nr": "2",
            "innvkat_5": {
              "alle": {
                "kjonn": {
                  "0": {
                    "enhet": {
                      "personer": "1226",
                      "prosent": "71,2"
                    }
                  },
                  "1": {
                    "enhet": {
                      "personer": "1055",
                      "prosent": "61,3"
                    }
                  },
                  "alle": {
                    "enhet": {
                      "personer": "2281",
                      "prosent": "66,3"
                    }
                  }
                }
              },
              "innvandrere": {
                "kjonn": {
                  "0": {
                    "enhet": {
                      "personer": "371",
                      "prosent": "68,3"
                    }
                  },
                  "1": {
                    "enhet": {
                      "personer": "139",
                      "prosent": "39"
                    }
                  },
                  "alle": {
                    "enhet": {
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
    }
  }
};
