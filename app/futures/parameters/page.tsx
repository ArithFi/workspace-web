"use client";
import PairCard from "@/app/futures/parameters/PairCard";

const CSR = () => {
  return (
    <div className={"grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2"}>
      <PairCard pair={"ETH/USDT"} />
      <PairCard pair={"BTC/USDT"} />
      <PairCard pair={"BNB/USDT"} />
      <PairCard pair={"MATIC/USDT"} />
      <PairCard pair={"ADA/USDT"} />
      <PairCard pair={"DOGE/USDT"} />
      <PairCard pair={"XRP/USDT"} />
      <PairCard pair={"SOL/USDT"} />
      <PairCard pair={"LTC/USDT"} />
      <PairCard pair={"AVAX/USDT"} />
    </div>
  );
};

export default CSR;
