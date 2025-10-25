import React from "react";
import Link from "next/link";
import { CircleX } from "lucide-react";
import LogoComponent from "./LogoComponent";

const OnboardToast = ({
  expand,
  expandSidebar,
}: {
  expand: boolean;
  expandSidebar: () => void;
}) => {
  return (
    <div
      className={`fixed cursor-grab ${
        expand
          ? "scale-100  right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 w-full h-full p-10"
          : "scale-100 right-10 animate-pulse bottom-10 w-72 h-32 p-5"
      } 
      z-50 origin-bottom-right transition-all  hover:animate-none duration-1000 ease-in-out bg-white shadow-red-200 shadow-lg border rounded-xl`}
      onDrag={(e) => {
        console.log(e);
      }}
    >
      {expand && (
        <CircleX
          className="absolute top-5 right-5 text-slate-600 cursor-pointer"
          onClick={() => {
            expandSidebar();
          }}
          size={30}
        />
      )}

      {expand && <LogoComponent className="" />}
      <div className="text-center flex flex-col justify-center items-center h-full">
        <p className="font-semibold text-lg select-none">
          You haven't on-boarded yet
        </p>
        <Link
          href={"/onboard"}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 py-2 mt-3 w-fit px-20 bg-primary/70 text-primary-foreground hover:bg-primary/90"
        >
          On-Board ⭐
        </Link>
      </div>
    </div>
  );
};

export default OnboardToast;
