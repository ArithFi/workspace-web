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
    <div className={"border w-full p-3 text-sm"}>
      <div className={"flex justify-between items-center"}>
        <div className={"font-bold text-lg text-gray-800"}>
          Pair: {data?.product}
        </div>
        <div className={"text-xs text-gray-500"}>
          {new Date(data?.ts).toLocaleString()}
        </div>
      </div>
      <div>R0: {data?.r0}</div>
      <div>c: {data?.c}</div>
      <div>ml: {data?.ml}</div>
      <div>ms: {data?.ms}</div>
      <div>rl: {data?.rl}</div>
      <div>rs: {data?.rs}</div>
      <div>dt: {data?.dt}</div>
      <div>prevRtl: {data?.prevRtl}</div>
      <div>prevRts: {data?.prevRts}</div>
      <div>rtl: {data?.rtl}</div>
      <div>rts: {data?.rts}</div>
    </div>
  );
};

export default PairCard;
