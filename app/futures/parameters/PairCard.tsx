"use client";
import useSWR from "swr";
import { FC, useEffect, useMemo, useState } from "react";
import { usePrevious } from "@uidotdev/usehooks";

const PairCard: FC<{
  pair: string;
}> = ({ pair }) => {
  const [url, setUrl] = useState("https://db.arithfi.com/arithfi_main");
  const mode = window.localStorage.getItem("mode") || "prod";

  const { data, mutate } = useSWR(
    pair ? `${url}/future/getRt?product=${pair}` : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) => data?.data),
    {
      refreshInterval: 3_000,
    },
  );

  useEffect(() => {
    if (mode === "test") {
      setUrl("https://db.nestfi.net/arithfi");
    } else {
      setUrl("https://db.arithfi.com/arithfi_main");
    }
    mutate();
  }, [mode]);

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
        value={data?.rtl.toFixed(12)}
      />
      <Item
        title={
          <p>
            R<sub>t</sub>
            <sup>S</sup> 看跌动态补偿费率
          </p>
        }
        value={data?.rts.toFixed(12)}
      />
      <Item
        title={"按日看涨资金费率"}
        value={`${(
          ((data?.rtl - data?.prevRtl) / data?.dt) *
          86400000 *
          100
        ).toFixed(4)}%`}
      />
      <Item
        title={"按日看跌资金费率"}
        value={`${(
          ((data?.rts - data?.prevRts) / data?.dt) *
          86400000 *
          100
        ).toFixed(4)}%`}
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
      <div className={`text-xs ${style}`}>{value}</div>
    </div>
  );
};
