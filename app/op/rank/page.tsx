"use client";

import { useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    to: "",
    add: "",
  });
  const [token, setToken] = useState("");

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

  const send = async () => {
    setStatus("loading");
    if (!isOk) {
      setStatus("error");
      return;
    }

    const mode = window.localStorage.getItem("mode") || "prod";
    let url;
    if (mode === "test") {
      // TODO
      url = "https://db.nestfi.net/arithfi/maintains/sendMessage";
    } else {
      // TODO
      url = "https://db.arithfi.com/arithfi_main/maintains/sendMessage";
    }

    if (addressArray?.length > 0) {
      for (const address of addressArray) {
        url = url + `?add=${encodeURIComponent(form.add)}&to=${address}`;
        try {
          await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
              token: `${Math.ceil(new Date().getTime() / 1000)}`,
            },
          })
            .then((res) => res.json())
            .then((res) => res.data);
        } catch (e) {}
      }
    } else {
      url = url + `?add=${encodeURIComponent(form.add)}`;
      try {
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
            token: `${Math.ceil(new Date().getTime() / 1000)}`,
          },
        })
          .then((res) => res.json())
          .then((res) => res.data);
      } catch (e) {}
    }
  };

  return (
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>目标地址:</label>
          <textarea
            value={addresses}
            placeholder={"目标地址"}
            onChange={(e) => {
              setAddresses(e.target.value);
            }}
            className={"border w-full p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>新增活跃积分</label>
          <input
            value={form.add}
            placeholder={"新增活跃积分"}
            onChange={(e) => {
              setForm({
                ...form,
                add: e.target.value,
              });
            }}
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
        <div className={"flex justify-end"}>
          <button
            className={
              "bg-yellow-500 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed px-4 text-sm"
            }
            onClick={send}
            disabled={!isOk || !addressArray?.length}
          >
            {status === "idle" && "新增积分"}
            {status === "success" && "新增成功"}
            {status === "error" && "新增失败"}
            {status === "loading" && "新增中..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Send;
