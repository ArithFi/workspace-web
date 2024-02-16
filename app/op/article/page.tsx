"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const Article = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    ts: "",
    lang: "en",
    title: "",
    brief: "",
    url: "",
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = async () => {
    setStatus("loading");

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      url = "https://db.nestfi.net/arithfi_main/maintains/saveArticle";
    } else {
      url = "https://db.arithfi.com/arithfi/maintains/saveArticle";
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
    form.lang
      ? `https://db.nestfi.net/arithfi_main/user/listArticle?lang=${form.lang}&start=0&count=20`
      : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => res.data),
  );

  const deleteArticle = async (id: number) => {
    const data = await fetch(
      `https://db.nestfi.net/arithfi_main/maintains/deleteArticle?id=${id}`,
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
    <div className={"flex flex-row space-x-4 h-[80vh]"}>
      <div className={"w-full max-w-xl flex flex-col gap-4 pt-4 pr-4 border-r"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>标题</label>
          <input
            value={form.title}
            placeholder={"标题"}
            onChange={(e) => {
              setForm({
                ...form,
                title: e.target.value,
              });
            }}
            className={"border w-full p-2"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>简介</label>
          <textarea
            value={form.brief}
            placeholder={"简介"}
            onChange={(e) => {
              setForm({
                ...form,
                brief: e.target.value,
              });
            }}
            className={"border p-2"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-sm font-medium"}>URL</label>
          <input
            value={form.url}
            placeholder={"URL"}
            onChange={(e) =>
              setForm({
                ...form,
                url: e.target.value,
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
            <option value={"en"}>英语</option>
            <option value={"pt"}>葡萄牙</option>
            <option value={"ko"}>韩语</option>
            <option value={"tr"}>土耳其语</option>
            <option value={"es"}>西班牙语</option>
            <option value={"vi"}>越南语言</option>
            <option value={"ru"}>俄罗斯语</option>
          </select>
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
      <div className={"w-full space-y-6 h-[80vh] overflow-scroll pr-4"}>
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
                  <div className={"text-blue-500 text-xs font-bold"}>
                    {item.lang}
                  </div>
                </div>
                <div className={"text-gray-800 text-xs"}>{item.ts}</div>
              </div>
              <div className={"text-gray-500 text-xs line-clamp-2"}>
                {item.brief}
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
                    await deleteArticle(item.id);
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
