"use client";
import { Loader2Icon } from "lucide-react";
import React, { useEffect } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const page = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const session = useSession();

  useEffect(() => {
    const fetchdata = async () => {
      if (code) {
        try {
          const response = await fetch(
            "https://form-x-eight.vercel.app/api/integrations/notion",
            {
              method: "POST",
              body: JSON.stringify({
                code: code,
                email: session.data?.user?.email,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            console.log(data);
          } else {
            const data = await response.json();
            console.log(data);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchdata();
  }, []);
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2Icon className="animate-spin" />
      <p className="text-5xl font-semibold">Adding Form flow to your notion</p>
    </div>
  );
};

export default page;
