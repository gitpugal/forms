import LogoComponent from "@/components/LogoComponent";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session: any = await getServerSession(authOptions);
  console.log(session.user.onboarded)
  console.log(session.user.onboarded != "false" && session.user.onboarded != false)
  if (session.user.onboarded != "false" && session.user.onboarded != false) {
    redirect("/dashboard");
  }
  return (
    <div className="bg-[#f5f5f5] w-screen h-screen flex items-start justify-start gap-0">
      <LogoComponent className="" />
      {children}
    </div>
  );
};

export default layout;
