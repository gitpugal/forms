import Link from "next/link";
import React from "react";

const LogoComponent = ({ className }: { className: string }) => {
  return (
    <Link
      href={"/"}
      className={`font-extralight  font-sans ${
        className
          ? `${className} ${
              className == "bac" &&
              "bg-white/50 backdrop-blur-sm rounded-md pl-2 absolute top-5 left-5"
            }`
          : "absolute top-6 left-8"
      } dark:text-white/50 text-black text-xl`}
    >
      Form{" "}
      <span className="font-serif italic relative right-2 text-2xl">flow</span>
    </Link>
  );
};

export default LogoComponent;
