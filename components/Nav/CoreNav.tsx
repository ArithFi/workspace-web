"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import jwtDecode from "jwt-decode";

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
      {
        path: "/futures/parameters",
        name: "动态持仓费参数",
      },
    ],
  },
  {
    path: "/op",
    name: "运营工具",
    children: [
      {
        path: "/op/atfscan",
        name: "ATFScan",
      },
      {
        path: "/op/send",
        name: "消息推送",
      },
      {
        path: "/op/deposit",
        name: "账户充值",
      },
      {
        path: "/op/relationship",
        name: "用户关系管理",
      },
      {
        path: "/op/virtual",
        name: "虚拟账号管理",
      },
    ],
  },
  {
    path: "/roi",
    name: "成本和绩效",
    role: "frank",
    children: [
      {
        path: "/roi/product",
        name: "产品部门",
      },
      {
        path: "/roi/develop",
        name: "技术部门",
      },
      {
        path: "/roi/brand",
        name: "品牌部门",
      },
      {
        path: "/roi/business",
        name: "商务部门",
      },
      {
        path: "/roi/community",
        name: "社区部门",
      },
    ],
  },
];

const CoreNav = () => {
  const pathname = usePathname();

  const filterMenu = useMemo(() => {
    let username = "-";
    const jwt = window.localStorage.getItem("auth");
    if (jwt) {
      const decode = jwtDecode(jwt);
      // @ts-ignore
      username = decode?.username;
    }
    return menu.filter((item) => {
      if (item.role) {
        return item.role === username;
      } else {
        return true;
      }
    });
  }, []);

  return (
    <div className={"space-y-8"}>
      {filterMenu.map((item, index) => (
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
