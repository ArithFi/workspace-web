"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const CheckAccount = () => {
  const router = useRouter();
  const path = usePathname();

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
    if (res.code !== 0) {
      router.push("/auth/login");
    }
    if (res.code === 0 && path === "/") {
      router.push("/futures");
    }
  };

  useEffect(() => {
    verify();
  }, []);

  return null;
};

export default CheckAccount;
