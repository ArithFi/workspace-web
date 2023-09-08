"use client";

import { useCallback, useEffect, useState } from "react";

const Send = () => {
  const [type, setType] = useState("1");
  const [botList, setBotList] = useState<string[]>([]);
  const [bot, setBot] = useState("");
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [status, setStatus] = useState("idle");

  const fetchBotList = useCallback(async () => {
    const auth = window.localStorage.getItem("auth");
    if (auth) {
      const data = await fetch(
        `https://cms.nestfi.net/workbench-api/telegram/botlist?type=0`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        },
      ).then((res) => res.json());
      setBotList(data.data);
      if (data.data?.[0]) {
        setBot(data.data[0]);
      }
    }
  }, []);

  useEffect(() => {
    fetchBotList();
  }, [fetchBotList]);

  const sendMessage = async () => {
    const auth = window.localStorage.getItem("auth");
    if (auth) {
      setStatus("loading");
      try {
        const data = await fetch(
          `https://cms.nestfi.net/workbench-api/telegram/sendTelegramMsg`,
          {
            headers: {
              Authorization: `Bearer ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              botName: bot,
              caption: caption,
              msg: message,
              type: type,
              parseMode: isMarkdown ? "Markdown" : null,
            }),
          },
        ).then((res) => res.json());
        const res = await data.data;
        if (res) {
          setStatus("success");
          setTimeout(() => {
            setStatus("idle");
          }, 3_000);
        } else {
          setStatus("error");
          setTimeout(() => {
            setStatus("idle");
          }, 3_000);
        }
      } catch (e) {
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
        }, 3_000);
      }
    }
  };

  return (
    <div className={"h-full w-full"}>
      <div className={"w-fit p-4 space-x-2"}>
        <label>1. Choose a bot:</label>
        <select
          name="bot"
          id="bot"
          className={"focus:outline-0 bg-gray-100 p-2 rounded"}
          onChange={(e) => setBot(e.target.value)}
        >
          {botList.map((bot, index) => (
            <option value={bot} key={index}>
              {bot}
            </option>
          ))}
        </select>
      </div>
      <div className={"w-fit p-4 space-x-2"}>
        <label>2. Choose a type:</label>
        <select
          name="bot"
          id="bot"
          className={"focus:outline-0 bg-gray-100 p-2 rounded"}
          onChange={(e) => setType(e.target.value)}
        >
          <option value={"1"}>Message</option>
          <option value={"2"}>Photo</option>
          <option value={"3"}>Video</option>
          <option value={"4"}>Forward Message</option>
        </select>
      </div>
      <div className={"w-full p-4 flex flex-col gap-2 max-w-xl"}>
        <label>3. Input content:</label>
        {type === "1" && (
          <div>
            <textarea
              className={"w-full border p-2"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div>
              <input
                id={"markdown"}
                type={"checkbox"}
                checked={isMarkdown}
                onChange={(e) => setIsMarkdown(e.target.checked)}
              />
              <label
                htmlFor={"markdown"}
                className={"cursor-pointer select-none ml-2"}
              >
                Markdown
              </label>
            </div>
          </div>
        )}
        {type === "2" && (
          <div className={"flex flex-col gap-2"}>
            <input
              placeholder="输入照片链接"
              className={"focus:outline-0 border p-2 w-full"}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <textarea
              className={"w-full border p-2"}
              value={caption}
              placeholder={"备注"}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div>
              <input
                id={"markdown"}
                type={"checkbox"}
                checked={isMarkdown}
                onChange={(e) => setIsMarkdown(e.target.checked)}
              />
              <label
                htmlFor={"markdown"}
                className={"cursor-pointer select-none ml-2"}
              >
                Markdown
              </label>
            </div>
          </div>
        )}
        {type === "3" && (
          <div className={"flex flex-col gap-2"}>
            <input
              placeholder="输入视频链接"
              className={"focus:outline-0 border p-2 w-full"}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <textarea
              className={"w-full border p-2"}
              value={caption}
              placeholder={"备注"}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div>
              <input
                id={"markdown"}
                type={"checkbox"}
                checked={isMarkdown}
                onChange={(e) => setIsMarkdown(e.target.checked)}
              />
              <label
                htmlFor={"markdown"}
                className={"cursor-pointer select-none ml-2"}
              >
                Markdown
              </label>
            </div>
          </div>
        )}
        {type === "4" && (
          <div className={"flex flex-col gap-2"}>
            <input
              placeholder="输入原文链接"
              className={"focus:outline-0 border p-2 w-full"}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <textarea
              className={"w-full border p-2"}
              value={caption}
              placeholder={"备注"}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div>
              <input
                id={"markdown"}
                type={"checkbox"}
                checked={isMarkdown}
                onChange={(e) => setIsMarkdown(e.target.checked)}
              />
              <label
                htmlFor={"markdown"}
                className={"cursor-pointer select-none ml-2"}
              >
                Markdown
              </label>
            </div>
          </div>
        )}
      </div>
      <button
        className={"bg-yellow-500 p-2 rounded ml-4"}
        onClick={sendMessage}
      >
        {status === "idle" && "Send Messages"}
        {status === "success" && "Success"}
        {status === "error" && "Error"}
        {status === "loading" && "Loading"}
      </button>
    </div>
  );
};

export default Send;
