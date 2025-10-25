import React from "react";
const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#f5f5f5] w-screen h-screen overflow-x-hidden overflow-y-scrollbar custom-scrollbar relative md:pt-0 pt-2">
      {children}
    </div>
  );
};

export default layout;
