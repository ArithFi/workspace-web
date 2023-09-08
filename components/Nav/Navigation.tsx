import Account from "@/components/Account";
import CoreNav from "@/components/Nav/CoreNav";
import RecentNav from "@/components/Nav/RecentNav";
import { FC } from "react";

const Navigation: FC<{
  active: string;
}> = (props) => {
  return (
    <div
      className={"w-full max-w-[260px] h-full border-r px-8 py-4 space-y-10"}
    >
      <Account />
      <CoreNav />
    </div>
  );
};

export default Navigation;
