"use client";
import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const searchParams: any = useSearchParams();
  const code: any = searchParams.get("code");
  const form_id: any = searchParams.get("state");
  const [isloading, setisloading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://form-x-eight.vercel.app/api/create-sheet", {
          method: "POST",
          body: JSON.stringify({ code, form_id }),
        });
        const data = await response.json();
        console.log(data);
        router.push("/dashboard");
        setisloading(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {isloading && (
        <div className="flex mb-20 flex-col items-center justify-center gap-5">
          <Loader2Icon size={40} className="animate-spin" />
          <p className="text-3xl font-semibold">
            Hold on!, Integration in process
          </p>
        </div>
      )}
    </div>
  );
};

export default page;
