import { Metadata } from "next";
import { ReactNode } from "react";
import Toolbar from "@/components/Toolbar";
import Navigation from "@/components/Nav/Navigation";

export const runtime = "edge";

const title = "运营工具 - ArithFi";
const description = "ArithFi";

export const metadata: Metadata = {
  title,
  description,
};

export default function Layout(props: { children: ReactNode }) {
  return (
    <div className={"h-full w-full flex relative justify-center"}>
      <div className={"max-w-[1920px] w-full h-full flex"}>
        <Navigation />
        <div
          className={
            "w-full px-8 mr-10 space-y-2 overflow-x-hidden break-all flex flex-col"
          }
        >
          <Toolbar />
          <div className={"flex-1"}>{props.children}</div>
        </div>
      </div>
    </div>
  );
}
