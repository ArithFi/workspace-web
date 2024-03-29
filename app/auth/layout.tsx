import React from "react";
import { Metadata } from "next";
export const runtime = "edge";

const title = "Auth - ArithFi";
const description = "ArithFi";

export const metadata: Metadata = {
  title,
  description,
};
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={"h-screen"}>{children}</div>;
}
