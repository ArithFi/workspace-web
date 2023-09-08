"use client";

import { useCallback, useEffect, useState } from "react";

const Send = () => {
  const [type, setType] = useState("1");
  const [botList, setBotList] = useState<string[]>([]);
  const [bot, setBot] = useState("");
  const [hasCaption, setHasCaption] = useState(false);
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
    }
  }, []);

  useEffect(() => {
    fetchBotList();
  }, [fetchBotList]);

  return <div>{JSON.stringify(botList)}</div>;
};

export default Send;
