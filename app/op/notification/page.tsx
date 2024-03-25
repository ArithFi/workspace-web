"use client";

import { useEffect, useMemo, useState } from "react";

const Page = () => {
  const [token, setToken] = useState("");
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState<{
    pushTokens: string[];
    title: string;
    body: string;
    data: {
      url: string;
    };
  }>({
    pushTokens: [],
    title: "",
    body: "",
    data: {
      url: "",
    },
  });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState([]);

  const isLangValid = useMemo(() => {
    return ["en", "vi", "ko", "tr", ""].includes(lang);
  }, [lang]);

  const fetchList = async (start: number, count: number, lang?: string) => {
    if (!token) return;
    let url = `https://db.nestfi.net/arithfi/maintains/listNotification?start=${start}&count=${count}`;
    if (lang) {
      url += `&lang=${lang}`;
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `${token}`,
      },
    }).then((res) => res.json());
    return res.data
      .filter((item: any) => item.marketing)
      .map((item: any) => item.pushToken);
  };

  useEffect(() => {
    (async () => {
      const count = 200;
      let start = 0;
      let result: string[] = [];
      while (true) {
        const list = await fetchList(0, 100, lang);
        result = result.concat(list);
        if (list.length < count) break;
        start += count;
      }
      result = Array.from(new Set(result));
      setForm({
        ...form,
        pushTokens: result,
      });
    })();
  }, [token, lang]);

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
      setResult(res);
      setStatus("idle");
    } catch (e) {
      console.log(e);
      setStatus("error");
    }
  };

  return (
    <div className={"w-full h-full flex flex-col pb-2"}>
      <div className={"w-full h-60 border-b p-4"}>
        <div className={"flex flex-row justify-between"}>
          <div className={"text-sm font-medium"}>
            待发送列表: {form.pushTokens.length}
          </div>
          <button
            className={"text-sm rounded text-red-500"}
            onClick={() => fetchList(0, 100)}
          >
            刷新
          </button>
        </div>
        <div className={"text-xs overflow-ellipsis"}>
          {form.pushTokens.join(",")}
        </div>
      </div>
      <div className={"flex-1 flex gap-2"}>
        <div className={"w-[40%] border-r"}>
          <div className={"w-full flex flex-col gap-2 p-4"}>
            <label className={"text-xs font-bold"}>语言</label>
            <input
              value={lang}
              placeholder={"Lang"}
              className={`border p-2 text-sm ${
                isLangValid ? "" : "border-red-500"
              }`}
              onChange={(e) => setLang(e.target.value)}
            />
          </div>
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
              placeholder={"消息标题"}
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
              placeholder={"消息内容"}
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
              placeholder={"https://"}
              className={"border p-2 text-sm"}
              onChange={(e) =>
                setForm({
                  ...form,
                  data: {
                    url: `/webview?url=${e.target.value}`,
                  },
                })
              }
            />
          </div>
          <div className={"flex justify-end p-4"}>
            <button
              className={`text-sm bg-[#0D6EFD] text-white p-2 rounded-[4px] disabled:opacity-50`}
              onClick={send}
              disabled={status !== "idle" || !isLangValid}
            >
              {status === "idle" && "发送消息"}
              {status === "loading" && "发送中"}
              {status === "error" && "发送失败"}
            </button>
          </div>
        </div>
        <div className={"flex-1"}>{JSON.stringify(result)}</div>
      </div>
    </div>
  );
};

export default Page;
