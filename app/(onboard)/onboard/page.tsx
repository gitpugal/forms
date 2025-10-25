"use client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import React, { useState, useEffect, ChangeEvent } from "react";

const Page = () => {
  const session = useSession();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const { toast } = useToast();
  const [userDetails, setUserDetails]: any = useState({
    first_name: "",
    last_name: "",
    phone: "",
    org_name: "",
  });
  const userDetailKeys: any = {
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone",
    org_name: "Organization Name",
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUserDetails((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onboard = async () => {
    // Check if all fields except phone are filled
    const requiredFields = ["first_name", "last_name", "org_name"];
    const missingFields = requiredFields.filter((field) => !userDetails[field]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in ${missingFields.join(", ")}`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsOnboarding(true);
    try {
      const response = await fetch("https://form-x-eight.vercel.app/api/onboard", {
        method: "POST",
        body: JSON.stringify({
          ...userDetails,
          email: session.data?.user?.email,
        }),
      });
      if (response.ok) {
        setIsOnboarding(false);
        toast({
          title: "Success!",
          description: "Your onboarding process is successful",
          duration: 5000,
        });
        const data = await response.json();
        data.user.org_name = data?.organization?.name;
        data.user.organization_id = data?.organization?.organization_id;
        data.user.org_disabled = data?.organization?.disabled;
        delete data?.user?.organizations;
        await signIn("credentials", {
          ...data.user,
          callbackUrl: "https://form-x-eight.vercel.app/dashboard",
        });
      } else {
        const { message } = await response.json();
        toast({
          title: "Can't Sign in",
          description: message,
          variant: "destructive",
          duration: 5000,
        });
        setIsOnboarding(false);
      }
    } catch (e) {
      setIsOnboarding(false);
      console.log(e);
      toast({
        title: "Can't On-Board",
        description: "An Exception Occurred. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="w-full h-full p-10 pt-24 flex flex-col items-center justify-start">
      <div className="flex flex-col items-center justify-center transition-opacity ease-in-out duration-200">
        <p className="font-semibold text-5xl text-gray-700">
          👋 Welcome to our Onboarding process!
        </p>
        <p className="text-xl mt-3 text-gray-500">
          Have a smooth onboarding process ahead
        </p>
      </div>
      <div className="w-4/5 grid mt-14 grid-cols-2 gap-10">
        {Object.entries(userDetails).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col items-center justify-between gap-3"
          >
            <p className="font-semibold w-full text-xl text-gray-700">
              Enter Your{" "}
              <span className="inline underline decoration-4 underline-offset-2 decoration-yellow-400">
                {userDetailKeys[key]}
              </span>
            </p>
            <input
              autoComplete="off"
              name={key}
              onChange={changeHandler}
              value={userDetails[key]}
              className="w-full text-2xl py-5 px-4 focus:outline-0 focus:border-none rounded-2xl"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start justify-start mt-10 w-4/5 scroll-pl-20 transition-all ease-in-out duration-700 gap-8">
        <button
          disabled={isOnboarding}
          className={`${
            isOnboarding ? "bg-black/60" : "bg-black"
          } px-10 py-3 group rounded-3xl font-bold text-white`}
          onClick={onboard}
        >
          Submit
          {isOnboarding ? (
            <Loader2 color="white" className="inline ml-3 animate-spin" />
          ) : (
            <ArrowRight className="inline ml-3 group-hover:ml-5 transition-all ease-in-out duration-200" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Page;
