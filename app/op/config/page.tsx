"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";
import useSWR from "swr";

const Page = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    key: "",
    value: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");
  const [url, setURL] = useState("https://db.arithfi.com/arithfi_main");

  const mode = window.localStorage.getItem("mode") || "prod";

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

  const { data, mutate } = useSWR(
    token ? `${url}/user/listConfig` : undefined,
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
    if (mode === "test") {
      setURL("https://db.nestfi.net/arithfi/maintains");
    } else {
      setURL("https://db.arithfi.com/arithfi_main/maintains");
    }
  }, [mode]);

  const send = async () => {
    setStatus("loading");
    if (!isOk) {
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(
        `${url}/saveConfig?key=${form.key}&value=${form.value}`,
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
      if (res) {
        setStatus("success");
        await mutate();
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        await mutate();
        setConfirm("");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    } catch (e) {
      setStatus("error");
      await mutate();
      setConfirm("");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>key</label>
          <input
            value={form.key}
            placeholder={"key"}
            onChange={(e) => {
              setForm({
                ...form,
                key: e.target.value,
              });
            }}
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>value</label>
          <input
            value={form.value}
            placeholder={"value"}
            onChange={(e) =>
              setForm({
                ...form,
                value: e.target.value,
              })
            }
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
        <div className={"w-full flex flex-col gap-2 mt-16"}>
          <label className={"text-xs font-bold"}>确认本次配置</label>
          <input
            value={confirm}
            placeholder={"请重复输入key"}
            className={`border p-2 ${
              confirm !== form.key && "border-red-500"
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
            disabled={!isOk || !addressArray?.length || confirm !== form.key}
          >
            {status === "idle" && "充值"}
            {status === "success" && "充值成功"}
            {status === "error" && "充值失败"}
            {status === "loading" && "充值中..."}
          </button>
        </div>
      </div>
      <div className={"w-full space-y-6 overflow-scroll border"}>
        {JSON.stringify(data)}
      </div>
    </div>
  );
};

export default Page;
