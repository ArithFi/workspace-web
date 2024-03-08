"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

const Price = () => {
  const [symbol, setSymbol] = useState("DOGE");
  // https://api.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT
  const { data: binanceFAPI, mutate: mutateBinance } = useSWR(
    `https://fapi.binance.com/fapi/v2/ticker/price?symbol=${symbol}USDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  // https://db.arithfi.com/arithfi_main/oracle/price?product=BTC/USDT
  const { data: atfAPI, mutate: mutateATF } = useSWR(
    `https://db.arithfi.com/arithfi_main/oracle/price?product=${symbol}/USDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  const [wsPrice, setWsPrice] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}usdt@ticker`,
    );

    ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      if (json.c) {
        setWsPrice(json.c);
      }
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className={"flex flex-col space-y-2"}>
      <div className={"flex flex-row space-x-2"}>
        {["BTC", "DOGE", "SOL"].map((item, index) => (
          <button
            key={index}
            className={`px-3 border-2 rounded-full border-gray-500 text-sm ${
              symbol === item ? "bg-gray-500 text-white" : ""
            }`}
            onClick={() => {
              setSymbol(item);
              mutateBinance();
              mutateATF();
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={"flex space-x-2"}>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-blue-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            WS API: wss://fstream.binance.com/ws/{symbol.toLowerCase()}
            usdt@ticker
          </div>
          <div className={"text-4xl text-gray-800"}>{Number(wsPrice)}</div>
        </div>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-red-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            REST API: https://fapi.binance.com/fapi/v2/ticker/price?symbol=
            {symbol}USDT
          </div>
          <div className={"text-4xl text-gray-800"}>{binanceFAPI?.price}</div>
        </div>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-yellow-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            REST API: https://db.arithfi.com/arithfi_main/oracle/price?product=
            {symbol}/USDT
          </div>
          <div className={"text-4xl text-gray-800"}>{atfAPI?.data}</div>
        </div>
      </div>
    </div>
  );
};

export default Price;
