"use client";

import { useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    telegram: "",
    discord: "",
  });
  const [token, setToken] = useState("");
  const [addressesString, setAddressString] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const send = async () => {
    setStatus("loading");

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.nestfi.net/arithfi/maintains/saveUserFixedPoint";
    } else {
      url = "https://db.arithfi.com/arithfi_main/maintains/saveUserFixedPoint";
    }

    const addresses = addressesString.split(",");

    for (const address of addresses) {
      if (isAddress(address)) {
        const prev = await getLastPoints(address);
        const now = Number(form?.telegram || 0) + prev;
        await fetch(
          `${url}?walletAddress=${address}&telegram=${now}&discord=0`,
          {
            method: "POST",
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
              token: `${Math.ceil(new Date().getTime() / 1000)}`,
            },
          },
        );
        setLogs([...logs, `${address}, now:${now}`]);
      }
    }

    setStatus("success");
  };

  const getLastPoints = async (walletAddress: string) => {
    try {
      const mode = window.localStorage.getItem("mode") || "prod";
      let url;
      if (mode === "test") {
        url = "https://db.nestfi.net/arithfi/maintains/listUserFixedPoints";
      } else {
        url =
          "https://db.arithfi.com/arithfi_main/maintains/listUserFixedPoints";
      }
      const data = await fetch(`${url}?walletAddress=${walletAddress}`, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data);
      return data[0]?.telegram;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>目标地址:</label>
          <textarea
            value={addressesString}
            placeholder={"目标地址"}
            onChange={(e) => {
              setAddressString(e.target.value);
            }}
            className={"border w-full p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>新增积分</label>
          <input
            value={form.telegram}
            onChange={(e) => {
              setForm({
                ...form,
                telegram: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
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
        <div className={"flex justify-end"}>
          <button
            className={
              "bg-yellow-500 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed px-4 text-sm"
            }
            onClick={send}
          >
            {status === "idle" && "更新积分"}
            {status === "success" && "更新成功"}
            {status === "error" && "更新失败"}
            {status === "loading" && "更新中..."}
          </button>
        </div>
      </div>
      <div className={"flex-1 flex-row"}>
        {logs.map((log, index) => (
          <div key={index}>
            <div>{log}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Send;
