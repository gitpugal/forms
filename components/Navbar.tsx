"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const session: any = useSession();
  return (
    <div className="w-full z-50 font-sans px-4 md:px-32 border-b-[1px] dark:border-white/20 border-black/10 py-4 fixed top-0 left-0  grid grid-cols-2 md:grid-cols-3 bg-white/5 backdrop-blur-md justify-between gap-0">
      <Link
        href={"/"}
        className="font-thin my-auto  font-sans dark:text-white/50 text-black text-lg md:text-3xl "
      >
        Form{" "}
        <span className="font-serif italic relative right-2 text-xl md:text-4xl">
          flow
        </span>
      </Link>

      <div className="hidden md:flex font-Lato flex-row items-center mx-auto justify-between gap-10">
        <a className="underline-effect font-normal" href="/">
          Home
        </a>
        <a className="underline-effect font-light" href="/about">
          About
        </a>
        <a className="underline-effect font-light" href="/pricing">
          Pricing
        </a>
        <a className="underline-effect font-light" href="/contact-us">
          Contact
        </a>
      </div>
      <div className="flex font-Lato flex-row items-center justify-end gap-3 md:gap-5">
        {session && session?.data?.user ? (
          <Link href={"/dashboard"} className="p-0 m-0">
            <p className="bg-gradient-to-tr from-teal-400 to-blue-600 rounded-full text-white h-10 w-10 flex p-0 font-semibold cursor-pointer items-center justify-center text-xl">
              {session?.data?.user?.email?.slice(0, 1).toUpperCase()}
            </p>
          </Link>
        ) : (
          <>
            <Link
              href={"/login"}
              className="hidden md:flex dark:text-white/70 text-black font-semibold  px-5 py-2 rounded-md cursor-pointer  "
            >
              Log in
            </Link>
            <Link
              href={"/sign-up"}
              className="hidden md:flex dark:text-black dark:bg-white bg-black  font-semibold  px-5 py-2 rounded-3xl cursor-pointer text-white "
            >
              Sign up
            </Link>
          </>
        )}

        <Sheet>
          <SheetTrigger>
            <Menu
              size={30}
              className="my-auto flex md:hidden text-black/50 cursor-pointer"
            />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-sm">
              {session?.data &&  <p className="flex flex-row items-center justify-start gap-2">
                  <span className="bg-gradient-to-tr from-teal-400 to-blue-600 rounded-full text-white h-7 w-7 flex p-0 font-semibold cursor-pointer items-center justify-center text-sm">
                    {session?.data?.user?.email?.slice(0, 1).toUpperCase()}
                  </span>
                  {session?.data?.user?.email?.split("@")[0]}
                </p>}
              </SheetTitle>
            </SheetHeader>
            <div className="flex mt-5 font-Lato flex-col items-start mx-auto justify-between gap-5">
              <a className="underline-effect font-normal" href="/">
                Home
              </a>
              <a className="underline-effect font-light" href="/about">
                About
              </a>
              <a className="underline-effect font-light" href="/pricing">
                Pricing
              </a>
              <a className="underline-effect font-light" href="/contact-us">
                Contact
              </a>
              <div className="grid relative right-1 grid-cols-2 items-center gap-3">
                <Link
                  href={"/login"}
                  className=" bg-black text-white font-semibold  px-5 py-2 rounded-md cursor-pointer  "
                >
                  Log in
                </Link>
                <Link
                  href={"/sign-up"}
                  className=" bg-black text-white font-semibold  px-5 py-2 rounded-md cursor-pointer  "
                >
                  Sign up
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
