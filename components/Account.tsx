"use client";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";

const Account = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!username) {
      const jwt = window.localStorage.getItem("auth");
      if (jwt) {
        const decode = jwtDecode(jwt);
        // @ts-ignore
        setUsername(decode?.username || "-");
      }
    }
  }, [username]);

  return (
    <div
      className={
        "ml-4 flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded cursor-pointer"
      }
    >
      <div className={"truncate"}>
        <div className={"text-md text-gray-800 truncate"}>{username}</div>
      </div>
    </div>
  );
};

export default Account;
