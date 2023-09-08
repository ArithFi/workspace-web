import { redirect } from "next/navigation";

export const runtime = "edge";

const Futures = () => {
  redirect("/futures/overview");
};

export default Futures;
