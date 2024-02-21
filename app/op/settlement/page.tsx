"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

const Send = () => {
  const [form, setForm] = useState({
    promoter: "",
  });
  const [token, setToken] = useState("");
  const [todoStatus, setTodoStatus] = useState(0);

  const { data, mutate } = useSWR(
    token
      ? `https://db.arithfi.com/arithfi_main/maintains/listSettlement?walletAddress=${form.promoter}&status=${todoStatus}`
      : undefined,
    (url) =>
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
      refreshInterval: 10_000,
    },
  );

  useEffect(() => {
    mutate();
  }, [todoStatus]);

  const agree = async (id: number) => {
    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.nestfi.net/arithfi/maintains/confirmSettlement";
    } else {
      url = "https://db.arithfi.com/arithfi_main/maintains/confirmSettlement";
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
        token: `${Math.ceil(new Date().getTime() / 1000)}`,
      },
      body: JSON.stringify({
        ids: [id],
        walletAddress: form.promoter,
      }),
    });
    await mutate();
  };

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>发起人</label>
          <input
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
      </div>
      <div className={"w-full space-y-6 overflow-scroll border"}>
        <div className={"flex flex-row items-center text-xs font-bold"}>
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
              <th className={"p-2"}>日期</th>
              <th className={"p-2"}>目标地址</th>
              <th className={"p-2"}>金额</th>
              <th className={"p-2"}>种类</th>
              <th className={"p-2"}>状态</th>
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
                      createTime: string;
                      updateTime: string;
                      date: string;
                      walletAddress: string;
                      chainId: number;
                      settlementAmount: number;
                      settlementCurrency: string;
                      type: string;
                      hash: string;
                      status: number;
                    },
                    index: number,
                  ) => (
                    <tr key={index} className={"border-b"}>
                      <td className={"p-2 text-center"}>{item.id}</td>
                      <td className={"p-2 text-center"}>{item.date}</td>
                      <td
                        className={"p-2 text-center"}
                      >{`${item.walletAddress.slice(
                        0,
                        6,
                      )}...${item.walletAddress.slice(-4)}`}</td>
                      <td className={"p-2 text-center"}>
                        {item.settlementAmount} ATF
                      </td>
                      <td className={"p-2 text-center"}>
                        {item.status === 0 && "待审核"}
                        {item.status === 1 && "已通过"}
                        {item.status === 2 && "已拒绝"}
                      </td>
                      <td className={"p-2 text-center"}>{item.type}</td>
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
                                await agree(item.id);
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
      </div>
    </div>
  );
};

export default Send;
