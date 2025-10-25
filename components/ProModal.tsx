"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: any) => {
      if (event.key == "formflowpromodal") {
        setIsOpen(event.newValue == "true" ? true : false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
  }, []);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(e) => {
        setIsOpen(e);
        if (e == false) {
          localStorage?.setItem("formflowpromodal", "false");
        }
      }}
    >
      <DialogContent className="min-w-[90vw] h-[80vh] flex flex-col items-center justify-center">
        <DialogHeader className="flex items-center justify-center flex-col ">
          <DialogTitle className="text-3xl m-0 p-0">
            Subscribe to{" "}
            <span
              className={`font-extralight font-sans  dark:text-white/50 text-black text-3xl`}
            >
              Form{" "}
              <span className="font-serif italic relative right-2 text-4xl">
                flow
              </span>
            </span>{" "}
            <i className="text-blue-500 font-semibold ">pro</i>
          </DialogTitle>
          <DialogDescription className="m-0 p-0">
            You must be an pro member to access this feature.
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={() => {
            setIsOpen(false);
            localStorage?.setItem("formflowpromodal", "false");
            router.push("/settings/profile#pricing");
          }}
          className="mt-5 mx-auto bg-blue-600 group hover:bg-blue-800 text-white px-10 py-3 rounded-md font-semibold text-xl italic underline underline-offset-1"
        >
          Go to pricing{" "}
          <ArrowRight className="inline ml-2 group-hover:translate-x-3 duration-200 ease-in-out" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
