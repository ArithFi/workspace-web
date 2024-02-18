"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

const Article = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    ts: "",
    os: "",
    target: "release",
    lang: "en",
    version: "",
    title: "",
    content: "",
    url: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = async () => {
    setStatus("loading");

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.arithfi.com/arithfi/maintains/saveReleaseLog";
    } else {
      url = "https://db.arithfi.com/arithfi_main/maintains/saveReleaseLog";
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
          ts: new Date().toISOString(),
        }),
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

  const { data, mutate } = useSWR(
    form.lang && form.os && form.target
      ? `https://db.arithfi.com/arithfi_main/user/listReleaseLog?os=${form.os}&lang=${form.lang}&target=${form.target}`
      : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => res.data),
  );

  const deleteReleaseLog = async (id: number) => {
    const data = await fetch(
      `https://db.arithfi.com/arithfi_main/maintains/deleteReleaseLog?id=${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      },
    );
    console.log(data);
    await mutate();
  };

  return (
    <div className={"flex flex-row space-x-4 h-full"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <div
            className={
              "w-full flex flex-row gap-2 justify-between items-center bg-gray-50 p-3 rounded-lg"
            }
          >
            <label className={"text-sm font-bold"}>语言</label>
            <select
              className={"border p-1 w-20"}
              onChange={(e) => {
                setForm({
                  ...form,
                  lang: e.target.value,
                });
              }}
            >
              <option value={"en"}>英语</option>
              <option value={"pt"}>葡萄牙</option>
              <option value={"ko"}>韩语</option>
              <option value={"tr"}>土耳其语</option>
              <option value={"es"}>西班牙语</option>
              <option value={"vi"}>越南语言</option>
              <option value={"ru"}>俄罗斯语</option>
            </select>
          </div>
          <div
            className={
              "w-full flex flex-row gap-2 justify-between items-center bg-gray-50 p-3 rounded-lg"
            }
          >
            <label className={"text-sm font-bold"}>OS</label>
            <select
              className={"border p-1 w-20"}
              onChange={(e) => {
                setForm({
                  ...form,
                  os: e.target.value,
                });
              }}
            >
              <option value={"ios"}>iOS</option>
              <option value={"android"}>Android</option>
            </select>
          </div>
        </div>
        <div
          className={
            "w-full flex flex-row gap-2 justify-between items-center bg-gray-50 p-3 rounded-lg"
          }
        >
          <label className={"text-sm font-bold"}>部署阶段</label>
          <select
            className={"border p-1 w-20"}
            onChange={(e) => {
              setForm({
                ...form,
                target: e.target.value,
              });
            }}
          >
            <option value={"release"}>正式</option>
            <option value={"test"}>测试</option>
          </select>
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-bold"}>版本</label>
          <input
            value={form.version}
            placeholder={"版本"}
            onChange={(e) =>
              setForm({
                ...form,
                version: e.target.value,
              })
            }
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-bold"}>标题</label>
          <input
            value={form.title}
            placeholder={"标题"}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-bold"}>内容</label>
          <textarea
            value={form.content}
            placeholder={"内容"}
            onChange={(e) =>
              setForm({
                ...form,
                content: e.target.value,
              })
            }
            className={"border p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-bold"}>URL</label>
          <input
            value={form.url}
            placeholder={"url"}
            onChange={(e) =>
              setForm({
                ...form,
                url: e.target.value,
              })
            }
            className={"border p-2 text-sm"}
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
          <label className={"text-sm font-bold"}>确认本次充值</label>
          <input
            value={confirm}
            placeholder={"请重复输入URL"}
            className={`border p-2 ${
              confirm !== form.url && "border-red-500"
            } rounded text-sm`}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className={"flex justify-end"}>
          <button
            className={
              "bg-yellow-500 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed px-4"
            }
            onClick={send}
            disabled={confirm !== form.url}
          >
            {status === "idle" && "保存"}
            {status === "success" && "保存成功"}
            {status === "error" && "保存失败"}
            {status === "loading" && "保存中..."}
          </button>
        </div>
      </div>
      <div className={"w-full space-y-6 h-full overflow-scroll pr-4"}>
        {data &&
          data.map((item: any, index: number) => (
            <div key={index} className={"border p-3 space-y-3"}>
              <div
                className={
                  "flex flex-row space-x-2 justify-between items-center"
                }
              >
                <div className={"flex flex-row space-x-2 items-center"}>
                  <div className={"font-bold text-xs"}>{item.title}</div>
                  <div className={"font-bold text-xs"}>{item.os}</div>
                  <div className={"font-bold text-xs"}>{item.target}</div>
                  <div className={"text-blue-500 text-xs font-bold"}>
                    {item.lang}
                  </div>
                </div>
                <div className={"text-gray-800 text-xs"}>{item.ts}</div>
              </div>
              <div className={"text-gray-500 text-xs line-clamp-2"}>
                {item.content}
              </div>
              <div className={"flex flex-row justify-between"}>
                <Link
                  href={item.url}
                  target={"_blank"}
                  className={"text-xs text-gray-800"}
                >
                  {item.url}
                </Link>
                <button
                  className={"text-xs text-red-500 font-bold"}
                  onChange={async () => {
                    await deleteReleaseLog(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Article;
