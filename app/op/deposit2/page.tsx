"use client";

import { useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";
import useSWR from "swr";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    amount: "",
    orderType: "DEPOSIT",
    info: "",
    promoter: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

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

  const { data } = useSWR(
    token ? "https://db.nestfi.net/arithfi_main/maintains/list" : undefined,
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
  );
  console.log(data);

  const send = async () => {
    setStatus("loading");
    if (!isOk) {
      setStatus("error");
      return;
    }

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.nestfi.net/arithfi/maintains/airdrop";
    } else {
      url = "https://db.nestfi.net/arithfi_main/maintains/airdrop";
    }

    try {
      const res = await fetch(url, {
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
      })
        .then((res) => res.json())
        .then((res) => res.value);
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
    <div className={"flex flex-row space-x-4 h-[80vh]"}>
      <div className={"h-full w-full max-w-xl flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>充值地址:</label>
          <textarea
            value={addresses}
            placeholder={"充值地址"}
            onChange={(e) => {
              setAddresses(e.target.value);
            }}
            className={"border w-full p-2"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>充值数量</label>
          <input
            value={form.amount}
            placeholder={"充值数量"}
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
          <label className={"text-sm font-medium"}>备注</label>
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
          <label className={"text-sm font-medium"}>发起人</label>
          <input
            value={form.promoter}
            placeholder={"发起人"}
            className={"border p-2"}
            onChange={(e) =>
              setForm({
                ...form,
                promoter: e.target.value,
              })
            }
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>签名</label>
          <input
            value={token}
            placeholder={"Token"}
            className={"border p-2"}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div className={"w-full flex flex-col gap-2 mt-16"}>
          <label className={"text-sm font-medium"}>确认本次充值</label>
          <input
            value={confirm}
            placeholder={"请重复输入充值金额"}
            className={`border p-2 ${
              confirm !== form.amount && "border-red-500"
            } rounded`}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className={"flex justify-end"}>
          <button
            className={
              "bg-yellow-500 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed px-4"
            }
            onClick={send}
            disabled={!isOk || !addressArray?.length || confirm !== form.amount}
          >
            {status === "idle" && "充值"}
            {status === "success" && "充值成功"}
            {status === "error" && "充值失败"}
            {status === "loading" && "充值中..."}
          </button>
        </div>
      </div>
      <div className={"w-full space-y-6 h-[80vh] overflow-scroll pr-4"}>
        {data &&
          data.map(
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
              <div key={index}>
                <div>{item.id}</div>
                <div>{item.createTime}</div>
                <div>{item.updateTime}</div>
                <div>{item.date}</div>
                <div>{item.walletAddress}</div>
                <div>{item.chainId}</div>
                <div>{item.settlementAmount}</div>
                <div>{item.settlementCurrency}</div>
                <div>{item.type}</div>
                <div>{item.hash}</div>
                <div>{item.status}</div>
              </div>
            ),
          )}
      </div>
    </div>
  );
};

export default Send;
