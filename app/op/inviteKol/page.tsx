"use client";

import { useState } from "react";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    walletAddress: "",
    inviteCode: "",
    nickName: "",
    inviteRewardRatio: "",
    status: 1,
    chainId: 56,
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = async () => {
    setStatus("loading");

    const mode = window.localStorage.getItem("mode") || "prod";
    let url, chainId;
    if (mode === "test") {
      chainId = 97;
      url = "https://db.arithfi.com/arithfi/maintains/saveKolInvite";
    } else {
      chainId = 56;
      url = "https://db.arithfi.com/arithfi_main/maintains/saveKolInvite";
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
          inviteRewardRatio: Number(form.inviteRewardRatio),
          chainId: chainId,
        }),
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
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div
        className={
          "h-full w-full max-w-md flex flex-col gap-4 pt-4 pr-4 border-r"
        }
      >
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>KOL地址</label>
          <input
            value={form.walletAddress}
            placeholder={"Copy KOL充值地址"}
            onChange={(e) => {
              setForm({
                ...form,
                walletAddress: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>Invite Code</label>
          <input
            value={form.walletAddress}
            placeholder={"Invite"}
            onChange={(e) => {
              setForm({
                ...form,
                inviteCode: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>昵称</label>
          <input
            value={form.nickName}
            placeholder={"nickName"}
            onChange={(e) => {
              setForm({
                ...form,
                nickName: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>邀请奖励比例</label>
          <input
            value={form.inviteRewardRatio}
            placeholder={"inviteRewardRatio"}
            className={"border p-2 text-sm"}
            onChange={(e) =>
              setForm({
                ...form,
                inviteRewardRatio: e.target.value,
              })
            }
          />
        </div>
        <div
          className={
            "w-full flex gap-2 flex-row justify-between bg-gray-100 p-4 rounded"
          }
        >
          <label className={"text-xs font-bold"}>状态</label>
          <select
            className={"text-xs bg-transparent font-bold"}
            onChange={(e) =>
              setForm({
                ...form,
                status: Number(e.target.value),
              })
            }
          >
            <option value={"1"}>开启</option>
            <option value={"0"}>关闭</option>
          </select>
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
          <label className={"text-xs font-bold"}>确认本次新增</label>
          <input
            value={confirm}
            placeholder={"请重复输入钱包地址"}
            className={`border p-2 ${
              confirm !== form.walletAddress && "border-red-500"
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
            disabled={confirm !== form.walletAddress}
          >
            {status === "idle" && "创建"}
            {status === "success" && "创建成功"}
            {status === "error" && "创建失败"}
            {status === "loading" && "创建中..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Send;
