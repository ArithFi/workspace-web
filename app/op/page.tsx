import { redirect } from "next/navigation";
export const runtime = "edge";

const Op = async () => {
  redirect("/op/send");
};

export default Op;
