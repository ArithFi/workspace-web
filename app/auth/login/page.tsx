"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const router = useRouter();

  const handleLogin = async () => {
    setStatus("loading");
    try {
      const data = await fetch(
        `https://cms.nestfi.net/workbench-api/sys/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      ).then((res) => res.json());
      if (data?.data) {
        setStatus("success");
        window.localStorage.setItem("auth", data.data);
        setTimeout(() => {
          router.push("/futures");
        }, 1_000);
      } else {
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
        }, 3_000);
      }
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full h-full flex bg-white gap-5 relative">
      <div className="w-full h-full flex flex-col justify-center items-center py-4 gap-8">
        <div className="text-center text-xl font-medium">ArithFi Workspace</div>
        <div className={"flex flex-col gap-2 max-w-[240px] w-full"}>
          <input
            className={"border focus:outline-none px-3 py-2"}
            placeholder={"username"}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
          <input
            className={"border focus:outline-none px-3 py-2"}
            type={"password"}
            placeholder={"password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <button
          disabled={!username || !password || status !== "idle"}
          onClick={handleLogin}
          className="flex px-3 py-2 min-w-[200px] text-white rounded-full items-center justify-center gap-2 bg-yellow-500 font-medium disabled:bg-gray-400"
        >
          {status === "idle" && "Sign in"}
          {status === "success" && "Success"}
          {status === "error" && "Error"}
          {status === "loading" && "Loading"}
        </button>
      </div>
    </div>
  );
}
