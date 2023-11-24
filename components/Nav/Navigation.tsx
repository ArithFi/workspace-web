"use client";
import Account from "@/components/Account";
import CoreNav from "@/components/Nav/CoreNav";

const Navigation = () => {
  return (
    <div
      className={"w-full max-w-[260px] h-full border-r px-8 py-4 space-y-10"}
    >
      <Account />
      <CoreNav />
      <button
        className={"px-6 font-medium text-sm text-red-500"}
        onClick={() => {
          window.localStorage.removeItem("auth");
          window.location.reload();
        }}
      >
        退出登陆
      </button>
    </div>
  );
};

export default Navigation;
