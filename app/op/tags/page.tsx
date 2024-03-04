"use client";

import { useMemo, useState } from "react";
import { isAddress } from "@ethersproject/address";
import useSWR from "swr";

const Send = () => {
  const [status, setStatus] = useState("idle");
  const [addresses, setAddresses] = useState("");
  const [form, setForm] = useState({
    tag: "NO_WITHDRAW",
    enable: true,
  });
  const [token, setToken] = useState("");
  const [confirm, setConfirm] = useState("");

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
      url = "https://db.nestfi.net/arithfi/maintains/saveUserTag";
    } else {
      url = "https://db.arithfi.com/arithfi_main/maintains/saveUserTag";
    }

    url =
      url +
      `?addresses=${addressArray?.join(",")}&tag=${form.tag}&enable=${
        form.enable
      }`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          token: `${Math.ceil(new Date().getTime() / 1000)}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data);
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
    <div className={"flex flex-row space-x-4 h-full pb-8"}>
      <div className={"h-full w-full max-w-md flex flex-col gap-4 pt-4"}>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>标记地址:</label>
          <textarea
            value={addresses}
            placeholder={"标记地址"}
            onChange={(e) => {
              setAddresses(e.target.value);
            }}
            className={"border w-full p-2 text-sm"}
          />
        </div>
        <div className={"w-full flex flex-col gap-2"}>
          <label className={"text-xs font-bold"}>标记</label>
          <input
            value={form.tag}
            placeholder={"标记"}
            className={"border p-2 text-sm"}
            onChange={(e) =>
              setForm({
                ...form,
                tag: e.target.value,
              })
            }
          />
        </div>
        <select
          className={"border p-1 w-20"}
          onChange={(e) => {
            setForm({
              ...form,
              enable: e.target.value === "true",
            });
          }}
        >
          <option value={"true"}>生效</option>
          <option value={"false"}>不生效</option>
        </select>
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
          <label className={"text-xs font-bold"}>确认本次标记</label>
          <input
            value={confirm}
            placeholder={"请重复输入标记"}
            className={`border p-2 ${
              confirm !== form.tag && "border-red-500"
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
            disabled={!isOk || !addressArray?.length || confirm !== form.tag}
          >
            {status === "idle" && "标记"}
            {status === "success" && "标记成功"}
            {status === "error" && "标记失败"}
            {status === "loading" && "标记中..."}
          </button>
        </div>
      </div>
      <div>
        {addressArray?.map((item, index) => (
          <AddressTag address={item} key={index} token={token} />
        ))}
      </div>
    </div>
  );
};

export default Send;

const AddressTag = ({ address, token }: { address: string; token: string }) => {
  const { data: tags } = useSWR(
    `https://db.nestfi.net/arithfi/maintains/listUserTags?walletAddress=${address}`,
    (url) =>
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => res.data),
  );

  return (
    <div className={"text-sm"}>
      <div>{address}</div>
      {tags.map((item: any, index: number) => (
        <div key={index} className={"flex justify-between"}>
          <div>{item.tag}</div>
          <div>{item.status ? "生效" : "不生效"}</div>
        </div>
      ))}
      <div></div>
    </div>
  );
};
