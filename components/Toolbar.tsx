"use client";
import { Switch } from "@headlessui/react";
import { useState } from "react";

const Toolbar = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className={"h-[60px] w-full flex items-center justify-between"}>
      <div className={"max-w-xl w-full"}>
        <input
          placeholder={"Search"}
          className={
            "w-full px-4 py-2 focus:bg-gray-100 focus:outline-0 rounded text-sm"
          }
        />
      </div>
      <div className={"text-sm font-semibold"}>
        <div
          className={
            "flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer select-none"
          }
          onClick={() => setEnabled(!enabled)}
        >
          <div
            className={`flex space-x-1 text-sm ${
              enabled ? "text-purple-500" : "text-gray-800"
            }`}
          >
            <div>测试模式</div>
          </div>
          <Switch
            checked={enabled}
            // onChange={setEnabled}
            className={`${enabled ? "bg-purple-500" : "bg-gray-200"}
          relative inline-flex h-[14px] w-[24px] shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
          >
            <span className="sr-only">测试模式</span>
            <span
              aria-hidden="true"
              className={`${enabled ? "translate-x-2.5" : "translate-x-0"}
            pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
