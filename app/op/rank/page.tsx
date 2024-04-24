"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    to: "",
    telegram: "",
    discord: "",
  });
  const [token, setToken] = useState("");

  const send = async () => {
    setStatus("loading");

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.nestfi.net/arithfi/maintains/saveUserFixedPoint";
    } else {
      url = "https://db.arithfi.com/arithfi_main/maintains/saveUserFixedPoint";
    }
    await fetch(
      `${url}?walletAddress=${form.to}&telegram=${form.telegram}&discord=${form.discord}`,
      {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      },
    )
      .then((res) => res.json())
      .then((res) => res.data);
  };

  const getLastPoints = async (walletAddress: string) => {
    const data = await fetch(
      `https://db.nestfi.net/arithfi/maintains/maintains/listUserFixedPoints?walletAddress=${walletAddress}`,
      {
        method: "GET",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      },
    )
      .then((res) => res.json())
      .then((res) => res.data);
    console.log(data);
  };

  useEffect(() => {
    if (token && isAddress(form.to)) {
      getLastPoints(form.to);
    } else {
      console.log("地址错误");
    }
  }, [form.to, token]);

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>目标地址:</label>
          <textarea
            value={form.to}
            placeholder={"目标地址"}
            onChange={(e) => {
              setForm({
                ...form,
                to: e.target.value,
              });
            }}
            className={"border w-full p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>电报活跃积分</label>
          <input
            value={form.telegram}
            placeholder={"电报积分"}
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
          <label className={"text-xs font-bold"}>Discord活跃积分</label>
          <input
            value={form.discord}
            placeholder={"Discord积分"}
            onChange={(e) => {
              setForm({
                ...form,
                discord: e.target.value,
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
    </div>
  );
};

export default Send;
