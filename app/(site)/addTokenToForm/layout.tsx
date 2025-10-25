import LogoComponent from "@/components/LogoComponent";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session: any = await getServerSession();
  if (session && !session.user) {
    redirect("/login");
  }
  return (
    <div className="w-full h-full flex items-center justify-center ">
      <LogoComponent className=""/>
      {children}
    </div>
  );
};

export default layout;
