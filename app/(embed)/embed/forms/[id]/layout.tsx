import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full overflow-y-auto object-contain">{children}</div>;
};

export default layout;
