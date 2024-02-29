"use client";
import useSWR from "swr";
import { FC, useMemo } from "react";
import { usePrevious } from "@uidotdev/usehooks";

const PairCard: FC<{
  pair: string;
}> = ({ pair }) => {
  const { data } = useSWR(
    pair
      ? `https://db.arithfi.com/arithfi_main/future/getRt?product=${pair}`
      : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) => data?.data),
    {
      refreshInterval: 3_000,
    },
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
          {data?.product}
        </div>
        <div className={"text-xs text-gray-500"}>
          {new Date(data?.ts).toLocaleString()}
        </div>
      </div>
      <Item
        title={
          <p>
            r<sub>0</sub> 基础补偿费率
          </p>
        }
        value={data?.r0}
      />
      <Item title={<p>c 最大费率</p>} value={data?.c} />
      <Item
        title={
          <p>
            V<sup>L</sup> 多头总仓位价值
          </p>
        }
        value={data?.ml}
      />
      <Item
        title={
          <p>
            V<sup>S</sup> 空头总仓位价值
          </p>
        }
        value={data?.ms}
      />
      <Item
        title={
          <p>
            R<sub>t</sub>
            <sup>L</sup> 看涨动态补偿费率
          </p>
        }
        value={data?.rtl.toFixed(9)}
      />
      <Item
        title={
          <p>
            R<sub>t</sub>
            <sup>S</sup> 看跌动态补偿费率
          </p>
        }
        value={data?.rts.toFixed(9)}
      />
    </div>
  );
};

export default PairCard;

const Item: FC<{
  title: React.ReactNode;
  value: string | number;
}> = ({ title, value }) => {
  const previousColor = usePrevious(value);

  const style = useMemo(() => {
    if (value > previousColor) {
      return "text-green-500 font-bold";
    } else if (value < previousColor) {
      return "text-red-500 font-bold";
    } else {
      return "text-gray-800";
    }
  }, [value, previousColor]);

  return (
    <div className={"flex justify-between hover:underline"}>
      <div className={"text-xs text-gray-800"}>{title}</div>
      <div className={`text-xs ${style}`}>{Number(value).toFixed(4)}</div>
    </div>
  );
};
