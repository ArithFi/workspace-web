"use client";

import { useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    amount: 0,
    info: "",
    ordertype: "DEPOSIT",
    block: false,
    blockReason: "",
  });
  const [token, setToken] = useState("");

  const addressArray = useMemo(
    () =>
      addresses
        ?.replaceAll(" ", "\n")
        ?.split("\n")
        .filter((item) => item !== ""),
    [addresses],
  );
  const isOk = useMemo(
    () => addressArray.every((item) => isAddress(item)),
    [addressArray],
  );

  const send = async () => {
    setStatus("loading");
    if (!isOk) {
      setStatus("error");
      return;
    }

    const mode = window.localStorage.getItem("mode") || "prod";
    let url, chainId;
    if (mode === "test") {
      url = "https://dev.nestfi.net/nestfi/op/user/airdrop";
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
          walletAddress: addressArray,
          chainId: chainId,
        }),
      })
        .then((res) => res.json())
        .then((res) => res.value);
      if (res) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className={"h-full w-full"}>
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>充值地址:</label>
        <textarea
          value={addresses}
          onChange={(e) => {
            setAddresses(e.target.value);
          }}
          className={"border w-full p-2"}
        />
      </div>
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>充值数量</label>
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
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>充值类型</label>
        <select
          className={"focus:outline-0 bg-gray-100 p-2 rounded"}
          onChange={(e) =>
            setForm({
              ...form,
              ordertype: e.target.value,
            })
          }
        >
          <option value={"DEPOSIT"}>DEPOSIT</option>
          <option value={"Freeze Deposit"}>Freeze Deposit</option>
        </select>
      </div>
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>充值账户</label>
        <select
          className={"focus:outline-0 bg-gray-100 p-2 rounded"}
          onChange={(e) =>
            setForm({
              ...form,
              block: e.target.value === "block",
            })
          }
        >
          <option value={"normal"}>可用账户</option>
          <option value={"block"}>冻结账户</option>
        </select>
        {form.block && (
          <input
            value={form.blockReason}
            placeholder={"冻结原因"}
            onChange={(e) =>
              setForm({
                ...form,
                blockReason: e.target.value,
              })
            }
            className={"border p-2"}
          />
        )}
      </div>
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
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
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>签名</label>
        <input
          value={token}
          placeholder={"Token"}
          className={"border p-2"}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <button
        className={"bg-yellow-500 p-2 rounded ml-4 disabled:bg-gray-200"}
        onClick={send}
        disabled={!isOk || !addressArray?.length}
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
