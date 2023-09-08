"use client";

import { useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    amount: 0,
    info: "",
    ordertype: "BLOCK_TO_AVAILABLE",
    walletAddress: "",
  });
  const [token, setToken] = useState("");

  const send = async () => {
    setStatus("loading");
    const mode = window.localStorage.getItem("mode") || "prod";
    let url, chainId;
    if (mode === "test") {
      url = "https://me.nestfi.net/arithfi/op/user/airdrop";
      chainId = 97;
    } else {
      url = "https://db.nestfi.net/nestfi/op/user/airdrop";
      chainId = 56;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
        body: JSON.stringify({
          ...form,
          chainId: chainId,
        }),
      })
        .then((res) => res.json())
        .then((res) => res.value);
      if (res) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    } catch (e) {
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <div className={"h-full w-full max-w-xl flex flex-col gap-4 pt-4"}>
      <div className={"w-full flex flex-col gap-2 "}>
        <label>用户地址:</label>
        <input
          value={form.walletAddress}
          onChange={(e) => {
            setForm({
              ...form,
              walletAddress: e.target.value,
            });
          }}
          className={"border w-full p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label>划转数量</label>
        <input
          value={form.amount}
          onChange={(e) => {
            setForm({
              ...form,
              amount: Number(e.target.value),
            });
          }}
          className={"border p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label>备注</label>
        <input
          value={form.info}
          placeholder={"备注"}
          onChange={(e) =>
            setForm({
              ...form,
              info: e.target.value,
            })
          }
          className={"border p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label>签名</label>
        <input
          value={token}
          placeholder={"Token"}
          className={"border p-2"}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <button
        className={"bg-yellow-500 p-2 rounded disabled:bg-gray-200"}
        onClick={send}
        disabled={!isAddress(form.walletAddress)}
      >
        {status === "idle" && "Send Messages"}
        {status === "success" && "Success"}
        {status === "error" && "Error"}
        {status === "loading" && "Loading"}
      </button>
    </div>
  );
};

export default Send;
