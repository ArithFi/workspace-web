import "./globals.css";
import type { Metadata } from "next";
import "cal-sans";
import { Inter } from "next/font/google";
import Script from "next/script";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import * as process from "process";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const title = "ArithFi";
const description = "ArithFi is a decentralized exchange for arbitrage trading";

export const metadata: Metadata = {
  title,
  description,
  viewport:
    "width=device-width, initial-scale=1, shrink-to-fit=no,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
  applicationName: "ATF",
  metadataBase: new URL(process.env.AUTH0_BASE_URL!),
  themeColor: "#fff",
  openGraph: {
    images: "/apple-touch-icon.png",
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@arithfi",
  },
  manifest: "/manifest.json",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`h-screen w-screen`}>
        <Script
          src={"https://www.googletagmanager.com/gtag/js?id=G-HT9Q8GW970"}
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', 'G-HT9Q8GW970');
              `}
        </Script>
        <TailwindIndicator />
        {props.children}
      </body>
    </html>
  );
}
