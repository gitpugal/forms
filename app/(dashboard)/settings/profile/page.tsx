"use client";
import useScrollToHash from "@/app/hooks/ScrollHook";
import SubscribeComponent from "@/components/SubscribeComponent";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function convertToBoolean(value: any) {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    const lowerCaseValue = value.trim().toLowerCase();
    if (lowerCaseValue === "true") {
      return true;
    } else if (lowerCaseValue === "false") {
      return false;
    }
  }
  // Default to false if value cannot be converted
  return false;
}
const page = () => {
  useScrollToHash();
  const { data: session, status, update }: any = useSession();
  const searchParams = useSearchParams();
  const payment_status = searchParams.get("payment_status");
  const transaction_id = searchParams.get("transaction_id");
  const [userData, setUserData]: any = useState(null);
  const [isFecthingUserData, setisFecthingUserData] = useState(false);
  const pricingPlans = [
    {
      price: "₹0",
      shortTitle: "Free",
      features: [
        "Create and manage basic forms",
        "Limited to 10 responses per month",
        "Standard support",
      ],
      price_id: null,
    },
    {
      price: "₹840",
      shortTitle: "Basic",
      features: [
        "Unlimited form creation",
        "Up to 1000 responses per month",
        "Advanced analytics",
        "Email notifications",
        "Standard support",
      ],
      price_id: "price_1PlOYlSAhPobOiy7eYawyfJ7",
    },
    {
      price: "₹1500",
      shortTitle: "Pro",
      features: [
        "All Basic features",
        "Priority support",
        "Custom branding",
        "3rd Party Integration support",
        "API access",
      ],
      price_id: "price_1PiK7eSAhPobOiy76qNlS58X",
    },
  ];

  const fetchUserData = async () => {
    setisFecthingUserData(true);
    try {
      const response = await fetch(
        `https://form-x-eight.vercel.app/api/user/${session?.user?.user_id}`
      );
      if (response.ok) {
        setisFecthingUserData(false);
        const data = await response.json();
        const sessionPro = convertToBoolean(session?.user?.pro);
        const dataPro = convertToBoolean(data?.user?.pro);
        console.log(sessionPro, dataPro);
        console.log(sessionPro != dataPro);
        if (sessionPro != dataPro) {
          update({
            user: {
              pro: data?.user?.pro,
              subscriptions: data?.user?.subscriptions || [],
            },
          });
        }
        setUserData(data?.user);
      }
    } catch (error) {
      setisFecthingUserData(false);
      console.log(error);
    }
    setisFecthingUserData(false);
  };
  useEffect(() => {
    if (status == "authenticated" && !userData) {
      fetchUserData();
    }
  }, [session, status]);

  return (
    <div className="w-full min-h-full overflow-x-hidden pb-20 md:pb-10 pt-7">
      <div className="w-full px-3 md:px-5 ">
        <div className="h-[15vh] md:h-[30vh] relative w-full bg-[#f5f5f5] rounded-xl md:rounded-3xl">
          <div className="md:w-28 w-20 md:h-28 h-20 shadow-xl rounded-full overflow-hidden flex items-center justify-center absolute left-8 md:left-12 bg-[#393939] -bottom-10">
            {session?.user?.profile_image != null &&
            session?.user?.profile_image != "null" ? (
              <img
                src={session?.user?.profile_image}
                alt="profile image"
                className="object-cover w-full h-full"
              />
            ) : (
              <p className="text-3xl font-inter text-white ">
                {session?.user?.email &&
                  `${session?.user?.email
                    ?.slice(0, 1)
                    ?.toUpperCase()}${session?.user?.email?.slice(1, 2)}`}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-3 md:px-14">
        <p className=" flex-1 font-semibold mt-16 opacity-80 text-xl">
          {session?.user?.first_name}
        </p>
        <p className="text-sm font-light">{session?.user?.email}</p>
      </div>

      <div className="w-full mt-10 px-3 md:px-10 " id="pricing">
        <div className="">
          <p className="text-[#0f0f0f] text-xl font-semibold md:text-2xl ">
            subscriptions
          </p>
          <p className="font-light text-gray-600 mb-8">
            Join our paid plans to unlock all premium features
          </p>
        </div>
        <SubscribeComponent
          fetchsubscription={() => {
            fetchUserData();
          }}
          pricing={pricingPlans}
          subscription={userData?.subscriptions}
          fetching={isFecthingUserData}
        />
      </div>
    </div>
  );
};

export default page;
