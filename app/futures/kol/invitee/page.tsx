"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSort from "@/app/hooks/useSort";

const Page = () => {
  const [inviteeInfo, setInviteeInfo] = useState([]);
  const searchParams = useSearchParams();
  const select = searchParams.get("wallet");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const { sortedData, sorts, sortBy } = useSort(inviteeInfo, "tradeAmount", {
    direction: "desc",
  });

  const getInviteeInfo = useCallback(async () => {
    if (!select) {
      setInviteeInfo([]);
      return;
    }
    const map: any = {};
    const auth = window.localStorage.getItem("auth");
    const res = await fetch(
      `https://me.nestfi.net/workbench-api/hedge/users/invitee/info?from=${from}&to=${to}&type=${type}&inviterWalletAddress=${select}`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    ).then((res) => res.json());
    Object?.keys(res?.data || {})?.forEach((item) => {
      if (!map?.[item]) {
        map[item] = {
          avgDestory: 0,
          avgDestoryTotal: 0,
          avgTradeAmount: 0,
          avgTradeAmountTotal: 0,
          avgTradeDealCount: 0,
          avgTradeDealCountTotal: 0,
          buyNest: 0,
          buyNestTotal: 0,
          destory: 0,
          destoryTotal: 0,
          fee: 0,
          feeTotal: 0,
          sellNest: 0,
          sellNestTotal: 0,
          tradeAmount: 0,
          tradeDealCount: 0,
          tradeDealCountTotal: 0,
          username: "",
          wallet: item,
          deposit: 0,
          withdraw: 0,
        };
      }
      res.data[item].forEach((i: any) => {
        map[item].avgDestory = map[item].avgDestory + i.avgDestory;
        map[item].avgDestoryTotal =
          map[item].avgDestoryTotal + i.avgDestoryTotal;
        map[item].avgTradeAmount = map[item].avgTradeAmount + i.avgTradeAmount;
        map[item].avgTradeAmountTotal =
          map[item].avgTradeAmountTotal + i.avgTradeAmountTotal;
        map[item].avgTradeDealCount =
          map[item].avgTradeDealCount + i.avgTradeDealCount;
        map[item].avgTradeDealCountTotal =
          map[item].avgTradeDealCountTotal + i.avgTradeDealCountTotal;
        map[item].buyNest = map[item].buyNest + i.buyNest;
        map[item].buyNestTotal = map[item].buyNestTotal + i.buyNestTotal;
        map[item].destory = map[item].destory + i.destory;
        map[item].destoryTotal = map[item].destoryTotal + i.destoryTotal;
        map[item].fee = map[item].fee + i.fee;
        map[item].feeTotal = map[item].feeTotal + i.feeTotal;
        map[item].sellNest = map[item].sellNest + i.sellNest;
        map[item].sellNestTotal = map[item].sellNestTotal + i.sellNestTotal;
        map[item].tradeAmount = map[item].tradeAmount + i.tradeAmount;
        map[item].tradeDealCount = map[item].tradeDealCount + i.tradeDealCount;
        map[item].tradeDealCountTotal =
          map[item].tradeDealCountTotal + i.tradeDealCountTotal;
        map[item].deposit = map[item].deposit + i.deposit;
        map[item].withdraw = map[item].withdraw + i.withdraw;
        if (map[item].username === "") {
          map[item].username = i.username;
        }
      });
    });
    setInviteeInfo(Object?.values(map) || []);
  }, []);

  useEffect(() => {
    getInviteeInfo();
  }, [getInviteeInfo]);

  return (
    <div>
      <div>
        Inviter: {select}, From: {from}, To: {to}
      </div>
      <table>
        <thead>
          {sortedData.length > 0 && (
            <tr>
              <th
                onClick={() => sortBy("wallet")}
                className={"w-40 text-start"}
              >
                地址
              </th>
              <th
                onClick={() => sortBy("username")}
                className={"w-40 text-start"}
              >
                用户名
              </th>
              <th
                onClick={() => sortBy("tradeAmount")}
                className={"w-40 text-start"}
              >
                总交易量
              </th>
              <th
                onClick={() => sortBy("tradeDealCount")}
                className={"w-40 text-start"}
              >
                交易次数
              </th>
              <th
                onClick={() => sortBy("destory")}
                className={"w-40 text-start"}
              >
                销毁
              </th>
              <th onClick={() => sortBy("fee")} className={"w-40 text-start"}>
                服务费
              </th>
              <th
                onClick={() => sortBy("buyNest")}
                className={"w-40 text-start"}
              >
                买币
              </th>
              <th
                onClick={() => sortBy("sellNest")}
                className={"w-40 text-start"}
              >
                卖币
              </th>
              <th
                onClick={() => sortBy("deposit")}
                className={"w-40 text-start"}
              >
                提现
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          {sortedData.length > 0 &&
            sortedData?.map((item: any, index) => (
              <tr key={index}>
                <td>{item.wallet}</td>
                <td>{item.username}</td>
                <td>{item.tradeAmount.toLocaleString()}</td>
                <td>{item.tradeDealCount.toLocaleString()}</td>
                <td>{item.destory.toLocaleString()}</td>
                <td>{item.fee.toLocaleString()}</td>
                <td>{item.buyNest.toLocaleString()}</td>
                <td>{item.sellNest.toLocaleString()}</td>
                <td>{item.deposit.toLocaleString()}</td>
                <td>{item.withdraw.toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
