"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import jwtDecode from "jwt-decode";

export default function Index() {
  useEffect(() => {
    const auth = window.localStorage.getItem("auth");
    if (auth) {
      // @ts-ignore
      const { exp } = jwtDecode(auth);
      if (exp < Date.now() / 1000) {
        redirect("/auth/login");
      } else {
        redirect("/futures");
      }
    }
  }, []);

  return <div>Checking your browser...</div>;
}
