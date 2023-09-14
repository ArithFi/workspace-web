"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CrossTable,
  LeftCrossTreeNode,
  TopCrossTreeNode,
} from "ali-react-table/pivot";

const KOL = () => {
  const _get7DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().slice(0, 10);
  };
  const [from, setFrom] = useState(_get7DaysAgo());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("d");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter1, setFilter1] = useState("all"); // all, main, airdrop
  const [filter2, setFilter2] = useState("all"); // all, country1
  const [filter3, setFilter3] = useState(""); // wallet
  const [select, setSelect] = useState("");
  const [inviteeInfo, setInviteeInfo] = useState([]);

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
    setLoading(true);
    const auth = window.localStorage.getItem("auth");
    const res = await fetch(
      `https://me.nestfi.net/workbench-api/hedge/users/kol/info?from=${from}&to=${to}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    ).then((res) => res.json());
    Object.values(res.data || {}).forEach((item: any) => {
      for (let i = 0; i < item.length; i++) {
        _list = _list.concat(item[i]);
      }
    });
    setList(
      _list.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    );
    setLoading(false);
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

  const getInviteeInfo = useCallback(async () => {
    if (!select) {
      setInviteeInfo([]);
      return;
    }
    const map: any = {};
    const auth = window.localStorage.getItem("auth");
    const res = await fetch(
      `https://me.nestfi.net/workbench-api/hedge/users/invitee/info?from=${from}&to=${to}&type=${type}&inviterWalletAddress=${select}`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    ).then((res) => res.json());
    await Object?.keys(res?.data || {})?.forEach((item) => {
      if (!map?.[item]) {
        map[item] = {
          avgDestory: 0,
          avgDestoryTotal: 0,
          avgTradeAmount: 0,
          avgTradeAmountTotal: 0,
          avgTradeDealCount: 0,
          avgTradeDealCountTotal: 0,
          buyNest: 0,
          buyNestTotal: 0,
          destory: 0,
          destoryTotal: 0,
          fee: 0,
          feeTotal: 0,
          sellNest: 0,
          sellNestTotal: 0,
          tradeAmount: 0,
          tradeDealCount: 0,
          tradeDealCountTotal: 0,
          username: "",
          wallet: item,
          deposit: 0,
          withdraw: 0,
        };
      }
      res.data[item].forEach((i: any) => {
        map[item].avgDestory = map[item].avgDestory + i.avgDestory;
        map[item].avgDestoryTotal =
          map[item].avgDestoryTotal + i.avgDestoryTotal;
        map[item].avgTradeAmount = map[item].avgTradeAmount + i.avgTradeAmount;
        map[item].avgTradeAmountTotal =
          map[item].avgTradeAmountTotal + i.avgTradeAmountTotal;
        map[item].avgTradeDealCount =
          map[item].avgTradeDealCount + i.avgTradeDealCount;
        map[item].avgTradeDealCountTotal =
          map[item].avgTradeDealCountTotal + i.avgTradeDealCountTotal;
        map[item].buyNest = map[item].buyNest + i.buyNest;
        map[item].buyNestTotal = map[item].buyNestTotal + i.buyNestTotal;
        map[item].destory = map[item].destory + i.destory;
        map[item].destoryTotal = map[item].destoryTotal + i.destoryTotal;
        map[item].fee = map[item].fee + i.fee;
        map[item].feeTotal = map[item].feeTotal + i.feeTotal;
        map[item].sellNest = map[item].sellNest + i.sellNest;
        map[item].sellNestTotal = map[item].sellNestTotal + i.sellNestTotal;
        map[item].tradeAmount = map[item].tradeAmount + i.tradeAmount;
        map[item].tradeDealCount = map[item].tradeDealCount + i.tradeDealCount;
        map[item].tradeDealCountTotal =
          map[item].tradeDealCountTotal + i.tradeDealCountTotal;
        map[item].deposit = map[item].deposit + i.deposit;
        map[item].withdraw = map[item].withdraw + i.withdraw;
        if (map[item].username === "") {
          map[item].username = i.username;
        }
      });
    });
    setInviteeInfo(Object?.values(map) || []);
  }, [select, from, to, type]);

  useEffect(() => {
    getInviteeInfo();
  }, [getInviteeInfo]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 交易人数
  const tradeCount = () => {
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
    const userRow = users
      .sort((a, b) => {
        return b.tradeCountTotal - a.tradeCountTotal;
      })
      .map((item) => ({
        key: item.wallet,
        value: item.wallet,
      }));

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
        leftTree={leftTree}
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
                onClick={() => {
                  // onOpen()
                  setSelect(leftNode.key);
                }}
              >
                {value}
              </button>
            );
          }
          return <div color={color}>{value}</div>;
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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
    const totalRow = [
      {
        key: null,
        value: null,
        title: "总计",
      },
    ];
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
        leftTree={leftTree}
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
                onClick={() => {
                  setSelect(leftNode.key);
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

  return <div>KOL</div>;
};

export default KOL;
