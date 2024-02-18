"use client";

import { useState } from "react";
import { isAddress } from "@ethersproject/address";

const CSR = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    targetAddress: "",
    bindAddress: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = async () => {
    setStatus("loading");
    const mode = window.localStorage.getItem("mode") || "prod";
    let chainId;
    if (mode === "test") {
      chainId = 97;
    } else {
      chainId = 56;
    }
    const url = `https://db.arithfi.com/arithfi/op/user/setVirtualAccount?targetAddress=${form.targetAddress}&bindAddress=${form.bindAddress}&chainId=${chainId}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data);
      if (res) {
        setStatus("success");
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    } catch (e) {
      setStatus("error");
      setConfirm("");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-bold"}>交易地址（无法提现）</label>
        <input
          value={form.targetAddress}
          placeholder={"TargetAddress"}
          className={"border p-2 text-sm"}
          onChange={(e) => setForm({ ...form, targetAddress: e.target.value })}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-bold"}>提现地址</label>
        <input
          value={form.bindAddress}
          placeholder={"BindAddress"}
          className={"border p-2 text-sm"}
          onChange={(e) => setForm({ ...form, bindAddress: e.target.value })}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-bold"}>签名</label>
        <input
          value={token}
          type={"password"}
          placeholder={"Token"}
          className={"border p-2 text-sm"}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div className={"w-full flex flex-col gap-2 mt-16"}>
        <label className={"text-sm font-bold"}>确认本次设置</label>
        <input
          value={confirm}
          placeholder={"请重复交易地址（无法提现）"}
          className={`border p-2 ${
            confirm !== form.targetAddress && "border-red-500"
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
            confirm !== form.targetAddress ||
            !isAddress(form.targetAddress) ||
            !isAddress(form.bindAddress)
          }
        >
          {status === "idle" && "设置"}
          {status === "success" && "设置成功"}
          {status === "error" && "设置失败"}
          {status === "loading" && "设置中..."}
        </button>
      </div>
    </div>
  );
};

export default CSR;
