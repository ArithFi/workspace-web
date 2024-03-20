"use client";

import { useEffect, useState } from "react";

const Page = () => {
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    pushTokens: [],
    title: "",
    body: "",
    data: "",
  });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState([]);

  const fetchList = async (start: number, count: number) => {
    const res = await fetch(
      `https://db.nestfi.net/arithfi/maintains/listNotification?start=${start}&count=${count}`,
    ).then((res) => res.json());

    if (res?.data?.length > 0) {
      const availableTokens = res.data
        .filter((item: any) => item.marketing)
        .map((item: any) => item.pushToken);
      setForm({
        ...form,
        pushTokens: availableTokens,
      });
    }
  };

  useEffect(() => {
    fetchList(0, 100);
  }, []);

  const send = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }).then((res) => res.json());
      console.log(res);
      setStatus("idle");
    } catch (e) {
      console.log(e);
      setStatus("error");
    }
  };

  return (
    <div className={"w-full h-full flex flex-col pb-2"}>
      <div className={"w-full h-60 border-b p-4"}>
        <div className={"text-sm font-medium"}>待发送列表:</div>
        <div className={"flex flex-row"}>
          {form.pushTokens.map((item: string, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      </div>
      <div className={"flex-1 flex gap-2"}>
        <div className={"w-[40%] border-r"}>
          <div className={"w-full flex flex-col gap-2 p-4"}>
            <label className={"text-xs font-bold"}>签名</label>
            <input
              value={token}
              placeholder={"Token"}
              className={"border p-2 text-sm"}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className={"w-full flex flex-col gap-2 p-4"}>
            <label className={"text-xs font-bold"}>消息标题</label>
            <input
              value={form.title}
              placeholder={"Token"}
              className={"border p-2 text-sm"}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className={"w-full flex flex-col gap-2 p-4"}>
            <label className={"text-xs font-bold"}>消息内容</label>
            <input
              value={form.body}
              placeholder={"Token"}
              className={"border p-2 text-sm"}
              onChange={(e) =>
                setForm({
                  ...form,
                  body: e.target.value,
                })
              }
            />
          </div>
          <div className={"w-full flex flex-col gap-2 p-4"}>
            <label className={"text-xs font-bold"}>消息跳转链接</label>
            <input
              placeholder={"Token"}
              className={"border p-2 text-sm"}
              onChange={(e) =>
                setForm({
                  ...form,
                  data: `/webview?url=${e.target.value}`,
                })
              }
            />
          </div>
          <div className={"flex justify-end p-4"}>
            <button
              className={`text-sm bg-[#0D6EFD] text-white p-2 rounded-[4px] disabled:opacity-50`}
              onClick={send}
              disabled={status !== "idle"}
            >
              发送消息
            </button>
          </div>
        </div>
        <div className={"flex-1"}></div>
      </div>
    </div>
  );
};

export default Page;
