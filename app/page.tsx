"use client";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  const verify = async () => {
    const auth = window.localStorage.getItem("auth");
    const res = await fetch(
      "https://cms.nestfi.net/workbench-api/sys/validate",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: auth,
        }),
      },
    ).then((res) => res.json());
    if (res.code === 0) {
      router.push("/futures");
    } else {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    verify();
  }, []);

  return <div>Checking your browser...</div>;
}
