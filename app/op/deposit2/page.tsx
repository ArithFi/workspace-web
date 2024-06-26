"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";
import useSWR from "swr";
import * as jose from "jose";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    amount: "",
    orderType: "",
    info: "",
    promoter: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");
  const [todoStatus, setTodoStatus] = useState(0);
  const [error, setError] = useState("");

  const mode = window.localStorage.getItem("mode") || "prod";

  const HOSTNAME = useMemo(() => {
    if (mode === "test") {
      return "https://db.nestfi.net/arithfi";
    } else {
      return "https://db.arithfi.com/arithfi_main";
    }
  }, [mode]);

  const addressArray = useMemo(
    () =>
      addresses
        ?.replaceAll(" ", "\n")
        ?.split("\n")
        .filter((item) => item !== "")
        .reduce((acc: string[], current) => {
          if (!acc.includes(current)) {
            acc.push(current);
          }
          return acc;
        }, []),
    [addresses],
  );
  const isOk = useMemo(
    () => addressArray.every((item) => isAddress(item)),
    [addressArray],
  );

  const { data, mutate } = useSWR(
    token
      ? `${HOSTNAME}/maintains/listAirdrop?walletAddress=${form.promoter}&status=${todoStatus}&count=100`
      : undefined,
    (url: string) =>
      fetch(url, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data),
    {
      refreshInterval: 5_000,
    },
  );

  useEffect(() => {
    // decode token with jose
    if (token) {
      try {
        const decodedToken = jose.decodeJwt(token);
        console.log(decodedToken);
        // 根据 exp 判断是否过期
        if (decodedToken?.exp) {
          if (decodedToken.exp > Math.ceil(new Date().getTime() / 1000)) {
            setForm({
              ...form,
              promoter: decodedToken.walletAddress as string,
            });
          } else {
            setForm({
              ...form,
              promoter: "Token 无效或者过期",
            });
          }
        } else {
          setForm({
            ...form,
            promoter: "Token 无效或者过期",
          });
        }
      } catch (e) {
        setForm({
          ...form,
          promoter: "",
        });
      }
    } else {
      setForm({
        ...form,
        promoter: "",
      });
    }
  }, [token]);

  useEffect(() => {
    mutate();
  }, [todoStatus, HOSTNAME, token]);

  const send = async () => {
    setStatus("loading");
    if (!isOk) {
      setStatus("error");
      return;
    }
    try {
      const res = await fetch(`${HOSTNAME}/maintains/airdrop`, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
        body: JSON.stringify(
          addressArray?.map((address) => ({
            walletAddress: address,
            amount: Number(form.amount),
            orderType: form.orderType,
            info: form.info,
            promoter: form.promoter,
          })),
        ),
      }).then((res) => res.json());
      if (res.error) {
        setError(res.error);
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
      if (res.data) {
        setStatus("success");
        await mutate();
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        await mutate();
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    } catch (e) {
      setStatus("error");
      setError(`${e}`);
      await mutate();
      setConfirm("");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const agree = async (id: number, batchNo: string) => {
    const res = await fetch(`${HOSTNAME}/maintains/confirmAirdrop`, {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
        token: `${Math.ceil(new Date().getTime() / 1000)}`,
      },
      body: JSON.stringify({
        ids: [id],
        batchNo: batchNo,
        walletAddress: form.promoter,
      }),
    }).then((res) => res.json());
    if (res.error) {
      setError(res.error);
    }
    await mutate();
  };

  const disagree = async (id: number, batchNo: string) => {
    await fetch(`${HOSTNAME}/maintains/rejectAirdrop`, {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
        token: `${Math.ceil(new Date().getTime() / 1000)}`,
      },
      body: JSON.stringify({
        ids: [id],
        batchNo: batchNo,
        walletAddress: form.promoter,
      }),
    });
    await mutate();
  };

  type ItemType = {
    id: number;
    walletAddress: string;
    chainId: number;
    amount: number;
    orderType: string;
    batchNo: string;
    info: string;
    status: number;
    promoter: string;
    promoteAt: string;
    auditor: string;
    auditAt: string;
  };

  const batchAgree = async (data: ItemType[]) => {
    const groupedData = data.reduce(
      (groups: Record<string, ItemType[]>, item) => {
        const { batchNo } = item;
        if (!groups[batchNo]) {
          groups[batchNo] = [];
        }
        groups[batchNo].push(item);
        return groups;
      },
      {},
    );
    for (const batchNo in groupedData) {
      const ids = groupedData[batchNo].map((item: any) => item.id);
      const res = await fetch(`${HOSTNAME}/maintains/confirmAirdrop`, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
        body: JSON.stringify({
          ids: ids,
          batchNo: batchNo,
          walletAddress: form.promoter,
        }),
      }).then((res) => res.json());
      if (res.error) {
        setError(res.error);
      }
    }
    await mutate();
  };

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>充值地址:</label>
          <textarea
            value={addresses}
            placeholder={"充值地址"}
            onChange={(e) => {
              setAddresses(e.target.value);
            }}
            className={"border w-full p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>充值数量</label>
          <input
            value={form.amount}
            placeholder={"充值数量"}
            onChange={(e) => {
              setForm({
                ...form,
                amount: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>充值类型</label>
          <select
            name="orderType"
            id="orderType"
            className={"focus:outline-0 bg-gray-100 p-2 rounded"}
            value={form.orderType}
            onChange={(e) =>
              setForm({
                ...form,
                orderType: e.target.value,
              })
            }
          >
            <option value={""}>请选择类型</option>
            <option value={"DEPOSIT"}>空投</option>
            <option value={"LIMITED"}>限时空投</option>
          </select>
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>备注</label>
          <input
            value={form.info}
            placeholder={"备注"}
            onChange={(e) =>
              setForm({
                ...form,
                info: e.target.value,
              })
            }
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>发起人</label>
          <input
            disabled
            value={form.promoter}
            placeholder={"发起人"}
            className={"border p-2 text-sm"}
            onChange={(e) =>
              setForm({
                ...form,
                promoter: e.target.value,
              })
            }
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>签名</label>
          <input
            value={token}
            placeholder={"Token"}
            className={"border p-2 text-sm"}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div className={"w-full flex flex-col gap-2 mt-16"}>
          <label className={"text-xs font-bold"}>确认本次充值</label>
          <input
            value={confirm}
            placeholder={"请重复输入充值金额"}
            className={`border p-2 ${
              confirm !== form.amount && "border-red-500"
            } rounded text-sm`}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className={"flex justify-end"}>
          <button
            className={
              "bg-yellow-500 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed px-4 text-sm"
            }
            onClick={send}
            disabled={
              !isOk ||
              !addressArray?.length ||
              confirm !== form.amount ||
              !form.orderType
            }
          >
            {status === "idle" && "充值"}
            {status === "success" && "充值成功"}
            {status === "error" && "充值失败"}
            {status === "loading" && "充值中..."}
          </button>
        </div>
        <div>{error && <div className={"text-red-500"}>{error}</div>}</div>
      </div>
      <div className={"w-full space-y-6 overflow-scroll border"}>
        <div className={"flex flex-row items-center text-xs font-bold m-3"}>
          <button
            className={`px-4 py-2 rounded ${
              todoStatus === 0 ? "bg-[#EAB308] text-white" : ""
            }`}
            onClick={() => {
              setTodoStatus(0);
            }}
          >
            待审批
          </button>
          <button
            className={`px-4 py-2 rounded ${
              todoStatus === 1 ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => {
              setTodoStatus(1);
            }}
          >
            已通过
          </button>
          <button
            className={`px-4 py-2 rounded ${
              todoStatus === 2 ? "bg-red-500 text-white" : ""
            }`}
            onClick={() => {
              setTodoStatus(2);
            }}
          >
            已拒绝
          </button>
        </div>
        <table className="table-auto w-full">
          <thead>
            <tr className={"text-xs border-b"}>
              <th className={"p-2"}>序号</th>
              <th className={"p-2"}>目标地址</th>
              <th className={"p-2"}>金额</th>
              <th className={"p-2"}>类型</th>
              <th className={"p-2"}>备注</th>
              <th className={"p-2"}>发起人</th>
              <th className={"p-2"}>操作</th>
            </tr>
          </thead>
          <tbody className={"text-xs"}>
            {data &&
              data
                .map(
                  (
                    item: {
                      id: number;
                      walletAddress: string;
                      chainId: number;
                      amount: number;
                      orderType: string;
                      batchNo: string;
                      info: string;
                      status: number;
                      promoter: string;
                      promoteAt: string;
                      auditor: string;
                      auditAt: string;
                    },
                    index: number,
                  ) => (
                    <tr key={index} className={"border-b"}>
                      <td className={"p-2 text-center"}>{item.id}</td>
                      <td className={"p-2 text-center"}>
                        {item.walletAddress}
                      </td>
                      <td className={"p-2 text-center"}>{item.amount} ATF</td>
                      <td className={"p-2 text-center"}>{item.orderType}</td>
                      <td className={"p-2 text-center"}>{item.info}</td>
                      <td className={"p-2 text-center"}>{`${item.promoter.slice(
                        0,
                        6,
                      )}...${item.promoter.slice(-4)}`}</td>
                      <td
                        className={
                          "flex flex-row items-center justify-center h-full p-2 space-x-2"
                        }
                      >
                        {item.status === 0 && (
                          <>
                            <button
                              className={"text-green-300 hover:text-green-500"}
                              onClick={async () => {
                                await agree(item.id, item.batchNo);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </button>
                            <button
                              className={"text-red-300 hover:text-red-500"}
                              onClick={async () => {
                                await disagree(item.id, item.batchNo);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                        {item.status === 1 && <div></div>}
                        {item.status === 2 && <div></div>}
                      </td>
                    </tr>
                  ),
                )
                .reverse()}
          </tbody>
        </table>
        <div>
          <button
            className={
              "text-xs p-3 border border-red-500 text-red-500 rounded m-3"
            }
            onClick={() => batchAgree(data)}
          >
            批量通过本页所有申请
          </button>
        </div>
      </div>
    </div>
  );
};

export default Send;
