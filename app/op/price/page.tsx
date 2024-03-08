"use client";

import useSWR from "swr";

const Price = () => {
  // https://api.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT
  const { data: binanceFAPI } = useSWR(
    `https://fapi.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  // https://db.arithfi.com/arithfi_main/oracle/price?product=BTC/USDT
  const { data: atfAPI } = useSWR(
    `https://db.arithfi.com/arithfi_main/oracle/price?product=BTC/USDT`,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      refreshInterval: 200,
    },
  );

  return (
    <div className={"flex flex-col space-y-2"}>
      <div className={"flex space-x-2"}>
        <div className={"flex flex-col w-fit p-4 border space-y-2 rounded"}>
          <div className={"text-xs text-gray-600"}>
            https://fapi.binance.com/fapi/v1/ticker/price
          </div>
          <div className={"text-4xl text-gray-800"}>{binanceFAPI?.price}</div>
        </div>
        <div className={"flex flex-col w-fit p-4 border space-y-2 rounded"}>
          <div className={"text-xs text-gray-600"}>
            https://db.arithfi.com/arithfi_main/oracle/price
          </div>
          <div className={"text-4xl text-gray-800"}>
            {atfAPI?.data.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Price;
