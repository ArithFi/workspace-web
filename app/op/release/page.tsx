"use client";

import { useState } from "react";

const Article = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    ts: "",
    os: "",
    target: "",
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
      url = "https://db.nestfi.net/arithfi_main/maintains/saveReleaseLog";
    } else {
      url = "https://db.arithfi.com/arithfi/maintains/saveReleaseLog";
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

  return (
    <div className={"h-full w-full max-w-xl flex flex-col gap-4 pt-4"}>
      <div className={"w-full flex flex-col gap-2"}>
        <div
          className={
            "w-full flex flex-row gap-2 justify-between items-center bg-gray-50 p-3 rounded-lg"
          }
        >
          <label className={"text-sm font-medium"}>OS</label>
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
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-medium"}>目标</label>
        <input
          value={form.target}
          placeholder={"目标"}
          onChange={(e) => {
            setForm({
              ...form,
              target: e.target.value,
            });
          }}
          className={"border p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-medium"}>版本</label>
        <input
          value={form.version}
          placeholder={"版本"}
          onChange={(e) =>
            setForm({
              ...form,
              version: e.target.value,
            })
          }
          className={"border p-2"}
        />
      </div>
      <div
        className={
          "w-full flex flex-row gap-2 justify-between items-center bg-gray-50 p-3 rounded-lg"
        }
      >
        <label className={"text-sm font-medium"}>语言</label>
        <select
          className={"border p-1 w-20"}
          onChange={(e) => {
            setForm({
              ...form,
              lang: e.target.value,
            });
          }}
        >
          <option value={"en"}>EN</option>
        </select>
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-medium"}>标题</label>
        <input
          value={form.title}
          placeholder={"标题"}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          className={"border p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-medium"}>内容</label>
        <textarea
          value={form.content}
          placeholder={"内容"}
          onChange={(e) =>
            setForm({
              ...form,
              content: e.target.value,
            })
          }
          className={"border p-2"}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label className={"text-sm font-medium"}>URL</label>
        <input
          value={form.url}
          placeholder={"url"}
          onChange={(e) =>
            setForm({
              ...form,
              url: e.target.value,
            })
          }
          className={"border p-2"}
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
          placeholder={"请重复输入URL"}
          className={`border p-2 ${
            confirm !== form.url && "border-red-500"
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
          disabled={confirm !== form.url}
        >
          {status === "idle" && "保存"}
          {status === "success" && "保存成功"}
          {status === "error" && "保存失败"}
          {status === "loading" && "保存中..."}
        </button>
      </div>
    </div>
  );
};

export default Article;
