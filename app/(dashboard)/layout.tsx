import DashboardSidebar from "@/components/DashboardSidebar";
import { ProModal } from "@/components/ProModal";
import TopNavbar from "@/components/TopNavbar";
import React, { Suspense } from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  // const { data: session, status }: any = await getServerSession();
  // if (session && !session.user && status == "") {
  //   redirect("/login");
  // }
  return (
    <div className="flex relative items-start justify-start gap-0 w-screen h-screen">
      <Suspense>
        {/* <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div> */}
        <DashboardSidebar />
        <ProModal />

        <div className="w-full  h-full flex flex-col items-start justify-start ">
          <div className="pt-[50px] relative overflow-y-auto overflow-x-hidden custom-scrollbar w-full h-full">
            <TopNavbar />
            {children}
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default layout;
