"use client";
import { useState } from "react";
import { isAddress } from "@ethersproject/address";

const Avatar = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sendStatus, setSendStatus] = useState("idle");
  const [address, setAddress] = useState("");

  const send = async () => {
    setSendStatus("loading");
    if (!isAddress(address)) {
      setSendStatus("error");
      return;
    }
    const token = window.localStorage.getItem("auth");

    try {
      let formData = new FormData();
      formData.append("file", file!);
      await fetch(
        `https://me.nestfi.net/workbench-api/nestfi/uploadFile?walletAddress=${address}`,
        {
          method: "POST",
          mode: "cors",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSendStatus("success");
    } catch (e) {
      setSendStatus("error");
    }
  };

  return (
    <div className={"w-full h-full max-w-xl flex flex-col gap-4 pt-4"}>
      <div className={"w-full flex flex-col gap-2"}>
        <label>KOL 地址</label>
        <input
          className={"border p-2 focus:outline-0"}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <label>头像</label>
        <input
          type={"file"}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <button
        disabled={!isAddress(address) || !file}
        onClick={send}
        className={"bg-yellow-500 p-2 rounded disabled:bg-gray-200"}
      >
        {sendStatus === "idle" && "上传"}
        {sendStatus === "loading" && "上传中"}
        {sendStatus === "error" && "失败"}
        {sendStatus === "success" && "成功"}
      </button>
    </div>
  );
};

export default Avatar;
