import LogoComponent from "@/components/LogoComponent";
import React, { Suspense } from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <div className="bg-[#f8fafc]  w-screen h-screen overflow-hidden">
        <LogoComponent className="bac" />
        {children}
      </div>
    </Suspense>
  );
};

export default layout;
