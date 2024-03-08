"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

const Price = () => {
  // https://api.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT
  const { data: binanceFAPI } = useSWR(
    `https://fapi.binance.com/fapi/v1/ticker/price?symbol=DOGEUSDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  // https://db.arithfi.com/arithfi_main/oracle/price?product=BTC/USDT
  const { data: atfAPI } = useSWR(
    `https://db.arithfi.com/arithfi_main/oracle/price?product=DOGE/USDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(
      "wss://fstream.binance.com/ws/dogeusdt@markPrice@1s",
    );

    ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      if (json.p) {
        setBtcPrice(json.p);
      }
    };

    return () => ws.close(); // 组件卸载时关闭连接
  }, []);

  return (
    <div className={"flex flex-col space-y-2"}>
      <div className={"flex space-x-2"}>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-red-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            REST API: https://fapi.binance.com/fapi/v1/ticker/price
          </div>
          <div className={"text-4xl text-gray-800"}>{binanceFAPI?.price}</div>
        </div>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-yellow-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            REST API: https://db.arithfi.com/arithfi_main/oracle/price
          </div>
          <div className={"text-4xl text-gray-800"}>
            {atfAPI?.data.toFixed(6)}
          </div>
        </div>
        <div
          className={
            "flex flex-col w-fit p-4 border-2 space-y-2 rounded border-blue-500"
          }
        >
          <div className={"text-xs text-gray-600"}>
            WS API: wss://fstream.binance.com/ws/
          </div>
          <div className={"text-4xl text-gray-800"}>
            {Number(btcPrice).toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Price;
