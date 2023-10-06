"use client";

import { useEffect, useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    amount: "",
    info: "",
    ordertype: "BLOCK_TO_AVAILABLE",
    walletAddress: "",
  });
  const [token, setToken] = useState("");
  const [balance, setBalance] = useState({
    id: 0,
    walletaddress: "",
    totalBanlance: 0,
    availableBalance: 0,
    freeze: 0,
    block: 0,
    withdrawaling: 0,
    copyBalance: 0,
  });

  const send = async () => {
    setStatus("loading");
    const mode = window.localStorage.getItem("mode") || "prod";
    const url = "https://db.arithfi.com/arithfi/op/user/transfer";
    let chainId;
    if (mode === "test") {
      chainId = 97;
    } else {
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
          amount: Number(form.amount),
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

  const getBalance = async (walletAddress: string, token: string) => {
    try {
      const mode = window.localStorage.getItem("mode") || "prod";
      const url = "https://db.arithfi.com/arithfi/op/user/asset/by-address";
      let chainId;
      if (mode === "test") {
        chainId = 97;
      } else {
        chainId = 56;
      }
      const data = await fetch(
        `${url}?chainId=${chainId}&walletAddress=${walletAddress}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      )
        .then((res) => res.json())
        .then((res) => res.value);
      setBalance(data);
    } catch (e) {
      console.log("fetch balance error");
    }
  };

  useEffect(() => {
    if (isAddress(form.walletAddress) && token) {
      getBalance(form.walletAddress, token);
    } else {
      setBalance({
        id: 0,
        walletaddress: "",
        totalBanlance: 0,
        availableBalance: 0,
        freeze: 0,
        block: 0,
        withdrawaling: 0,
        copyBalance: 0,
      });
    }
  }, [form.walletAddress, token]);

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
      {balance?.walletaddress && (
        <div className={"w-full text-xs border p-4 rounded grid grid-cols-2"}>
          <div>total balance: {balance?.totalBanlance}</div>
          <div>available balance: {balance?.availableBalance}</div>
          <div>freeze: {balance?.freeze}</div>
          <div>block: {balance?.block}</div>
          <div>withdrawaling: {balance?.withdrawaling}</div>
          <div>copy balance: {balance?.copyBalance}</div>
        </div>
      )}
      <div className={"w-full flex flex-col gap-2"}>
        <label>划转数量</label>
        <input
          value={form.amount}
          onChange={(e) => {
            setForm({
              ...form,
              amount: e.target.value,
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
