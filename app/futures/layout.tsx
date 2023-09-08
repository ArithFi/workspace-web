import { Metadata } from "next";
import { ReactNode } from "react";
import Dock from "@/components/Dock";
import Toolbar from "@/components/Toolbar";
import Navigation from "@/components/Nav/Navigation";

export const runtime = "edge";

const title = "Futures - ArithFi";
const description = "Futures";

export const metadata: Metadata = {
  title,
  description,
};

export default function Layout(props: { children: ReactNode }) {
  return (
    <div className={"h-full w-full flex relative justify-center"}>
      <div className={"max-w-[1920px] w-full h-full flex"}>
        <Navigation active={"/futures"} />
        <div
          className={"w-full px-8 mr-10 space-y-2 overflow-hidden break-all"}
        >
          <Toolbar />
          {props.children}
        </div>
      </div>
      <Dock />
    </div>
  );
}
