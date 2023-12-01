"use client";

import { useState } from "react";
import { isAddress } from "@ethersproject/address";

const CSR = () => {
  const [klAddress, setKlAddress] = useState("");
  const [userAddresses, setUserAddresses] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({
    status: "idle",
    success: 0,
    error: 0,
  });

  const send = async () => {
    const addressArray = userAddresses.split("\n");
    addressArray.forEach((item, index) => {
      if (item === "") {
        addressArray.splice(index, 1);
      }
    });
    setStatus({
      status: "loading",
      success: 0,
      error: 0,
    });
    let success = 0,
      error = 0;
    for (const item of addressArray) {
      if (!isAddress(item)) {
        return;
      }
      try {
        await fetch(
          "https://db.arithfi.com/dashboardapi/users/users/saveInviteUser",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: item,
              code: klAddress.slice(-8).toLowerCase(),
              timestamp: new Date().getTime() / 1000,
            }),
          },
        );
        success++;
      } catch (e) {
        console.log(e);
        error++;
      }
    }
    setStatus({
      status: "idle",
      success,
      error,
    });
  };

  return (
    <div className={"h-full w-full max-w-xl flex flex-col gap-4 pt-4"}>
      <div className={"text-xl font-medium"}>用户关系管理</div>
      <input
        placeholder={"KL 地址"}
        className={"border p-2"}
        value={klAddress}
        onChange={(e) => setKlAddress(e.target.value)}
      />
      <textarea
        placeholder={"用户地址"}
        className={"border p-2 min-h-[300px]"}
        value={userAddresses}
        onChange={(e) => setUserAddresses(e.target.value)}
      />
      <div className={"flex items-center gap-2 justify-between"}>
        <div className={"shrink-0 text-sm"}>关系层级</div>
        <select className={"border p-1 w-20"}>
          <option value={"1"}>1</option>
        </select>
      </div>
      <div className={"flex gap-2 mt-20"}>
        <input
          placeholder={"确认 KL 地址"}
          className={"border p-2 w-full"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          onClick={send}
          disabled={
            !isAddress(klAddress) ||
            !userAddresses ||
            confirm !== klAddress ||
            status.status === "loading"
          }
          className={
            "bg-yellow-500 text-white p-2 disabled:opacity-50 disabled:cursor-auto shrink-0"
          }
        >
          {status.status === "loading" ? "Loading" : "增加关系"}
        </button>
      </div>
      <div className={"text-sm font-medium"}>
        <div className={"text-green-500"}>成功：{status.success}</div>
        <div className={"text-red-500"}>失败：{status.error}</div>
      </div>
    </div>
  );
};

export default CSR;
