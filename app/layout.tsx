import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { ReactNode } from "react";
import CheckAccount from "@/components/CheckAccount";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const title = "ArithFi";
const description = "ArithFi is a decentralized exchange for arbitrage trading";

export const metadata: Metadata = {
  title,
  description,
  viewport:
    "width=device-width, initial-scale=1, shrink-to-fit=no,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
  applicationName: "ATF",
  themeColor: "#fff",
  manifest: "/manifest.json",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`h-screen w-screen`}>
        <TailwindIndicator />
        <CheckAccount />
        {props.children}
      </body>
    </html>
  );
}
