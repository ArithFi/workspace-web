"use client";
import useSWR from "swr";
import { FC } from "react";

const PairCard: FC<{
  pair: string;
}> = ({ pair }) => {
  const { data } = useSWR(
    pair
      ? `https://db.arithfi.com/arithfi/op/future/getRt?product=${pair}`
      : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) => data?.value),
  );

  return (
    <div
      className={
        "border w-full p-3 text-sm hover:shadow-lg cursor-pointer group"
      }
    >
      <div className={"flex justify-between items-center"}>
        <div
          className={
            "font-bold text-lg text-gray-800 group-hover:text-[#EAB308]"
          }
        >
          Pair: {data?.product}
        </div>
        <div className={"text-xs text-gray-500"}>
          {new Date(data?.ts).toLocaleString()}
        </div>
      </div>
      <Item title={"交易对常数, R0"} value={data?.r0.toFixed(6)} />
      <Item title={"交易对常数, c"} value={data?.c.toFixed(6)} />
      <Item title={"看涨仓位, ml"} value={data?.ml.toFixed(6)} />
      <Item title={"看跌仓位, ms"} value={data?.ms.toFixed(6)} />
      <Item title={"看涨持仓费率积分系数, rl"} value={data?.rl} />
      <Item title={"看跌持仓费率积分系数, rs"} value={data?.rs} />
      <Item title={"距离上次更新的秒数, dt"} value={data?.dt} />
      <Item title={"上次更新的rtl, prevRtl"} value={data?.prevRtl.toFixed(6)} />
      <Item title={"上次更新的rts, prevRts"} value={data?.prevRts.toFixed(6)} />
      <Item title={"看涨动态持仓费的积分, rtl"} value={data?.rtl.toFixed(6)} />
      <Item title={"看跌动态持仓费的积分, rts"} value={data?.rts.toFixed(6)} />
    </div>
  );
};

export default PairCard;

const Item: FC<{
  title: string;
  value: string | number;
}> = ({ title, value }) => {
  return (
    <div className={"flex justify-between hover:text-red-500 hover:font-bold"}>
      <div className={"text-xs"}>{title}</div>
      <div className={"text-xs"}>{value}</div>
    </div>
  );
};
