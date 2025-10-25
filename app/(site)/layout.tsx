import { getServerSession } from "next-auth";
import {  redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session: any = await getServerSession();
  if (session && !session.user) {
    console.log("no user")
    redirect("/login");
  }
  return (
    <div className="relative w-screen h-screen ">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      {children}
    </div>
  );
};

export default layout;
