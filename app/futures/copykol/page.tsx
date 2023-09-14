"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CrossTable,
  LeftCrossTreeNode,
  TopCrossTreeNode,
} from "ali-react-table/pivot";
import { Tab } from "@headlessui/react";

const CopyKOL = () => {
  const _get7DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().slice(0, 10);
  };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [from, setFrom] = useState(_get7DaysAgo());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("d");
  const [list, setList] = useState<any[]>([]);
  const [filter1, setFilter1] = useState("all"); // all, main, airdrop
  const [filter2, setFilter2] = useState("all"); // all, country1
  const [filter3, setFilter3] = useState(""); // wallet

  const filterList = useMemo(() => {
    return list
      .filter((item) => {
        if (filter1 === "airdrop") return item.airdrop;
        if (filter1 === "main") return item.main;
        return true;
      })
      .filter((item) => {
        if (filter2 === "all") return true;
        return item.country === filter2;
      })
      .filter((item) => {
        if (!filter3) return true;
        return (
          item.wallet.toLowerCase().startsWith(filter3.toLowerCase()) ||
          item.username.toLowerCase().startsWith(filter3.toLowerCase())
        );
      });
  }, [list, filter1, filter2, filter3]);

  const countryList = useMemo(() => {
    return list
      .map((item) => item.country)
      .filter(
        (item, index, arr) =>
          arr.findIndex((_item) => _item === item) === index,
      );
    // .filter(item => item)
  }, [list]);

  // 获取用户列表，并去重复，得到用户列表
  const users = useMemo(() => {
    return filterList.filter(
      (item, index, arr) =>
        arr.findIndex((_item) => _item.wallet === item.wallet) === index,
    );
  }, [filterList]);

  const fetchList = useCallback(async () => {
    let _list: any[] = [];
    const auth = window.localStorage.getItem("auth");
    const res = await fetch(
      `https://me.nestfi.net/workbench-api/hedge/users/copy/kol/info?from=${from}&to=${to}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    ).then((res) => res.json());
    Object.values(res.data).forEach((item: any) => {
      for (let i = 0; i < item.length; i++) {
        _list = _list.concat(item[i]);
      }
    });
    setList(
      _list.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    );
  }, [from, to, type]);

  const topTreeDates = useMemo(() => {
    return filterList
      .map((item) => item.date)
      .filter(
        (item, index, arr) =>
          arr.findIndex((_item) => _item === item) === index,
      )
      .map((item) => {
        return {
          key: item,
          value: item,
        };
      });
  }, [filterList]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 交易人数
  const tradeCount = () => {
    const userRow = users
      .sort((a, b) => {
        return b.tradeCountTotal - a.tradeCountTotal;
      })
      .map((item) => ({
        key: item.wallet,
        value: item.wallet,
      }));

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.tradeCountTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.tradeCount;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = list.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      if (topNode.key === "total") {
        return _user[0].tradeCountTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.tradeCount.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 交易量
  const tradeAmount = () => {
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
    const userRow = users
      .sort((a, b) => {
        return b.tradeAmountTotal - a.tradeAmountTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const leftTree = [...totalRow, ...userRow, ...totalRow];

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.tradeAmountTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.tradeAmount;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].tradeAmountTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.tradeAmount.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 客单价
  const avgTradeAmount = () => {
    const totalRow = [
      {
        key: null,
        value: null,
      },
    ];
    const userRow = users
      .sort((a, b) => {
        return b.avgTradeAmountTotal - a.avgTradeAmountTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const leftTree = [...totalRow, ...userRow, ...totalRow];

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "avgTradeAmountTotal", value: "客单价" },
      { key: "avgDestoryTotal", value: "平均通缩" },
      { key: "avgTradeDealCountTotal", value: "人均交易次数" },
    ];

    const topTree = [...topTreeLocked];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        return "";
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      } else if (topNode.key === "avgTradeAmountTotal") {
        return _user[0]?.avgTradeAmountTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      } else if (topNode.key === "avgDestoryTotal") {
        return _user[0]?.avgDestoryTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      } else if (topNode.key === "avgTradeDealCountTotal") {
        return _user[0]?.avgTradeDealCountTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      } else if (topNode.key === "username") {
        return _user[0]?.username;
      } else {
        return "-";
      }
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 交易人次
  const tradeUserTotal = () => {
    const userRow = users
      .sort((a, b) => {
        return b.tradeDealCountTotal - a.tradeDealCountTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.tradeDealCountTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.tradeDealCount;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].tradeDealCountTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.tradeDealCount.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 每日销毁
  const destory = () => {
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
    const userRow = users
      .sort((a, b) => {
        return b.destoryTotal - a.destoryTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.destoryTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        if (topNode.key === "country") {
          return "";
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.destory;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].destoryTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.destory.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 累计买币
  const buyNest = () => {
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
    const userRow = users
      .sort((a, b) => {
        return b.buyNestTotal - a.buyNestTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.buyNestTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.buyNest;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].buyNestTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.buyNest.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 累计卖币
  const sellNest = () => {
    const userRow = users
      .sort((a, b) => {
        return b.sellNestTotal - a.sellNestTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.sellNestTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.sellNest;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }

      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].sellNestTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.sellNest.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 每日手续费
  const fee = () => {
    const userRow = users
      .sort((a, b) => {
        return b.feeTotal - a.feeTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.feeTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.fee;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }
      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].feeTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.fee.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 每日充值
  const deposit = () => {
    const userRow = users
      .sort((a, b) => {
        return b.depositTotal - a.depositTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.depositTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.deposit;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }
      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].depositTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.deposit.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  // 每日提现
  const withdraw = () => {
    const userRow = users
      .sort((a, b) => {
        return b.withdrawTotal - a.withdrawTotal;
      })
      .map((item) => {
        return {
          key: item.wallet,
          value: item.wallet,
        };
      });

    const topTreeLocked = [
      { key: "username", value: "用户名", lock: true },
      { key: "country", value: "国家", lock: true },
      { key: "total", value: "总计", lock: true },
    ];

    const topTree = [...topTreeLocked, ...topTreeDates];

    const getValue = (
      leftNode: LeftCrossTreeNode,
      topNode: TopCrossTreeNode,
    ) => {
      if (!leftNode.key) {
        if (topNode.key === "country") {
          return "";
        }
        if (topNode.key === "username") {
          return "";
        }
        if (topNode.key === "total") {
          const _total = filterList
            .reduce((prev, curr) => {
              const _user = prev.find(
                (item: any) => item.wallet === curr.wallet,
              );
              if (!_user) {
                prev.push(curr);
              }
              return prev;
            }, [])
            .reduce((prev: any, curr: any) => {
              return prev + curr.withdrawTotal;
            }, 0);
          return _total.toLocaleString("en", {
            maximumFractionDigits: 2,
          });
        }
        return filterList
          .filter((item) => item.date === topNode.key)
          .reduce((prev, curr) => {
            return prev + curr.withdraw;
          }, 0)
          .toLocaleString("en", {
            maximumFractionDigits: 2,
          });
      }
      const _user = filterList.filter((item) => item.wallet === leftNode.key);
      if (topNode.key === "country") {
        return _user[0]?.country;
      }
      if (topNode.key === "total") {
        return _user[0].withdrawTotal.toLocaleString("en", {
          maximumFractionDigits: 2,
        });
      }
      if (topNode.key === "username") {
        return _user[0]?.username;
      }
      return (
        _user
          .find((item) => item.date === topNode.key)
          ?.withdraw.toLocaleString("en", {
            maximumFractionDigits: 2,
          }) || 0
      );
    };

    return (
      <CrossTable
        stickyTop={36}
        defaultColumnWidth={100}
        leftTree={userRow}
        topTree={topTree}
        getValue={getValue}
        render={(value, leftNode, topNode) => {
          let color = "",
            fontWeight = "";
          if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.main
          ) {
            color = "red";
            fontWeight = "bold";
          } else if (
            leftNode.key &&
            users.find((item) => item.wallet === leftNode.key)?.airdrop
          ) {
            color = "blue";
            fontWeight = "bold";
          }
          if (topNode.key === "username" && leftNode.key !== null) {
            return (
              <button
                hidden={leftNode.key === "total"}
                onClick={() => {
                  window.open(
                    `/futures/copykol/invitee?wallet=${leftNode.key}&from=${from}&to=${to}&type=${type}`,
                    "_blank",
                  );
                }}
              >
                {value}
              </button>
            );
          }
          return <div>{value}</div>;
        }}
      />
    );
  };

  const menu = [
    {
      title: "交易人数",
      panel: tradeCount(),
    },
    {
      title: "交易量",
      panel: tradeAmount(),
    },
    {
      title: "客单价+平均通缩+人均交易次数",
      panel: avgTradeAmount(),
    },
    {
      title: "交易人次",
      panel: tradeUserTotal(),
    },
    {
      title: "每日销毁",
      panel: destory(),
    },
    {
      title: "每日手续费",
      panel: fee(),
    },
    {
      title: "累计买币量",
      panel: buyNest(),
    },
    {
      title: "累计卖币量",
      panel: sellNest(),
    },
    {
      title: "每日充值",
      panel: deposit(),
    },
    {
      title: "每日提现",
      panel: withdraw(),
    },
  ];

  return (
    <div className={"overflow-y-auto"}>
      <div className={"flex pb-2 text-sm gap-2 items-center"}>
        <input
          className={"border p-2"}
          type={"date"}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className={"border p-2"}
          type={"date"}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          className={`border w-10 p-2 ${
            type === "d" ? "bg-yellow-500 text-white" : ""
          }`}
          onClick={() => setType("d")}
        >
          日
        </button>
        <button
          className={`border w-10 p-2 ${
            type === "w" ? "bg-yellow-500 text-white" : ""
          }`}
          onClick={() => setType("w")}
        >
          周
        </button>
        <button
          className={`border w-10 p-2 ${
            type === "m" ? "bg-yellow-500 text-white" : ""
          }`}
          onClick={() => setType("m")}
        >
          月
        </button>
        <select
          className={"border p-2"}
          onChange={(e) => {
            setFilter1(e.target.value);
          }}
        >
          <option value="all">标记</option>
          <option value="main">重点</option>
          <option value="airdrop">空投</option>
        </select>
        <select
          className={"border p-2"}
          onChange={(e) => {
            setFilter2(e.target.value);
          }}
        >
          <option value="all">国家</option>
          {countryList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          className={"border p-2"}
          defaultValue={filter3}
          placeholder={"search..."}
          onChange={(e) => setFilter3(e.target.value)}
        />
        <div>筛选后共 {users.length - 1} 位 KOL</div>
      </div>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl p-1">
          {menu.map((item, index) => (
            <Tab
              key={index}
              className={`py-2.5 px-3 text-sm font-medium rounded-lg  ${
                index === selectedIndex ? "bg-yellow-500 text-white" : ""
              }`}
            >
              {item.title}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {menu.map((item, index) => (
            <Tab.Panel key={index}>{item.panel}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default CopyKOL;
