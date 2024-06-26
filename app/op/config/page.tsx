"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";
import useSWR from "swr";
import ReactJson from "react-json-view";

const Page = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    key: "",
    value: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");
  const [url, setURL] = useState("https://db.arithfi.com/arithfi_main");

  const mode = window.localStorage.getItem("mode") || "prod";

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
      setURL("https://db.nestfi.net/arithfi");
    } else {
      setURL("https://db.arithfi.com/arithfi_main");
    }
  }, [mode]);

  const send = async () => {
    setStatus("loading");
    try {
      const res = await fetch(
        `${url}/maintains/saveConfig?key=${form.key}&value=${encodeURIComponent(
          form.value,
        )}`,
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
    <div className={"flex flex-row space-x-8 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>键</label>
          <input
            value={form.key}
            placeholder={"Key"}
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
          <label className={"text-xs font-bold"}>值</label>
          <textarea
            value={form.value}
            placeholder={"Value"}
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
            placeholder={"请重复输入Key"}
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
            disabled={confirm !== form.key}
          >
            {status === "idle" && "充值"}
            {status === "success" && "充值成功"}
            {status === "error" && "充值失败"}
            {status === "loading" && "充值中..."}
          </button>
        </div>
        <div className={"flex flex-col gap-2"}>
          <div className={"font-bold text-xs"}>常用 Key</div>
          <div className={"flex gap-2"}>
            <div className={"text-xs font-bold border p-1"}>
              home_support_url
            </div>
            <div className={"text-xs font-bold border p-1"}>home_banner_en</div>
            <div className={"text-xs font-bold border p-1"}>home_popup</div>
          </div>
        </div>
        <div className={"flex flex-col gap-2"}>
          <div className={"font-bold text-xs"}>常用 Value</div>
          <div className={"flex gap-2 flex-col"}>
            <div className={"text-xs font-bold border p-1"}>
              {JSON.stringify([
                {
                  name: "banner1",
                  image: "https://xxx",
                  link: "https://xxx",
                },
              ])}
            </div>
            <div className={"text-xs font-bold border p-1"}>
              {JSON.stringify({
                version: 1,
                data: {
                  en: {
                    image: "https://xxx",
                    link: "https://xxx",
                  },
                  vi: {
                    image: "https://xxx",
                    link: "https://xxx",
                  },
                  ko: {
                    image: "https://xxx",
                    link: "https://xxx",
                  },
                  tr: {
                    image: "https://xxx",
                    link: "https://xxx",
                  },
                },
              })}
            </div>
          </div>
        </div>
      </div>
      <ReactJson src={data} />
    </div>
  );
};

export default Page;
