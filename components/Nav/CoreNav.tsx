"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    path: "/futures",
    name: "期货",
    children: [
      {
        path: "/futures/overview",
        name: "期货总览仪表盘",
      },
      {
        path: "/futures/users",
        name: "期货用户仪表盘",
      },
      {
        path: "/futures/open",
        name: "期货交易仪表盘",
      },
      {
        path: "/futures/copytrading",
        name: "跟单仪表盘",
      },
      {
        path: "/futures/transaction",
        name: "期货交易",
      },
      {
        path: "/futures/kol",
        name: "KOL 交叉表",
      },
      {
        path: "/futures/copykol",
        name: "Copy KOL 交叉表",
      },
    ],
  },
  {
    path: "/op",
    name: "运营工具",
    children: [
      {
        path: "/op/send",
        name: "消息推送",
      },
      {
        path: "/op/deposit",
        name: "账户充值",
      },
      {
        path: "/op/transfer",
        name: "账户划转",
      },
      {
        path: "/op/avatar",
        name: "KOL头像设置",
      },
    ],
  },
];

const CoreNav = () => {
  const pathname = usePathname();

  return (
    <div className={"space-y-8"}>
      {menu.map((item, index) => (
        <div key={index}>
          <div className={"flex space-x-2 items-center"}>
            <div className={`bg-white w-4 h-5`}></div>
            <div className={`text-xs font-semibold "text-gray-800"`}>
              {item.name}
            </div>
          </div>
          <div className={"ml-6"}>
            {item.children.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className={`text-sm ${
                    pathname === item.path ? "text-yellow-500" : "text-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoreNav;
