"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import CircleBg from "@/components/CircleBg";
import Link from "next/link";
import {
  Grid,
  Users,
  Edit,
  BarChart2,
  Table,
  Zap,
  ArrowRight,
  Check,
  FlameIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FormFlowFooter from "@/components/Footer";

const page = () => {
  const [DarkMode, setDarkMode] = useState(false);
  const features = [
    {
      title: "Centralized Workspaces",
      description:
        "Manage all your forms in one place by creating workspaces. Easily create multiple forms and organize projects efficiently. Invite members, assign roles, and collaborate seamlessly.",
      icon: (
        <Grid
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
    {
      title: "Collaborative Team Management",
      description:
        "Add and manage team members. Assign roles to ensure everyone has the right access. Work together in real-time to create, edit, and manage forms.",
      icon: (
        <Users
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
    {
      title: "Intuitive Block-Style Editor",
      description:
        "Build and customize forms with our user-friendly editor. Drag and drop elements to create professional forms quickly. Publish and share forms effortlessly.",
      icon: (
        <Edit
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
    {
      title: "Comprehensive Form Analytics",
      description:
        "Track form performance with detailed analytics. Monitor metrics like open rates and submissions to optimize forms and improve user engagement.",
      icon: (
        <BarChart2
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
    {
      title: "Detailed Response Management",
      description:
        "View and manage form responses in an organized table. Filter and analyze responses to make informed decisions. Export data for further analysis.",
      icon: (
        <Table
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
    {
      title: "Seamless Integrations",
      description:
        "Integrate forms with popular services like Google Sheets and Notion. Automatically update data in real-time to enhance workflow and keep everything in sync.",
      icon: (
        <Zap
          color="white"
          size={50}
          className="bg-teal-400  p-3 rounded-full text-white"
        />
      ),
    },
  ];

  const pricingPlans = [
    {
      price: "$0",
      shortTitle: "Free",
      features: [
        "Create and manage basic forms",
        "Limited to 10 responses per month",
        "Standard support",
      ],
    },
    {
      price: "$9.99",
      shortTitle: "Basic",
      features: [
        "Unlimited form creation",
        "Up to 1000 responses per month",
        "Advanced analytics",
        "Email notifications",
        "Standard support",
      ],
    },
    {
      price: "$19.99",
      shortTitle: "Pro",
      features: [
        "All Basic features",
        "Priority support",
        "Custom branding",
        "3rd Party Integration support",
        "API access",
      ],
    },
  ];

  return (
    <div
      className={`w-full font-Lato relative h-screen overflow-y-auto pb-20 z-50 ${
        DarkMode ? "dark bg-black" : "bg-white"
      }`}
    >
      <CircleBg />
      <button
        onClick={() => {
          setDarkMode((prev) => !prev);
        }}
        className="dark:bg-white dark:text-black bg-black text-white  rounded-full h-20 w-20 z-[100]  shadow-2xl font-semibold cursor-pointer fixed right-5 bottom-5"
      >
        {DarkMode ? "LHT" : "DRK"}
      </button>
      <div className="min-h-full w-full z-50 relative bg-transparent pb-10">
        <Navbar />
        <div className="z-50  dark:text-white text-black  w-full  flex flex-col items-center justify-start pt-36">
          {/* <p className="font-thin dark:text-white text-black text-6xl ">
            Form{" "}
            <span className="font-serif font-semibold italic bg-gradient-to-tr from-blue-500 to-teal-500  bg-clip-text pl-5 text-transparent relative right-10 text-7xl">
              flow
            </span>
          </p> */}
          <button className="bg-white/20 backdrop-blur-sm mb-2 border dark:shadow-customlight shadow-custom dark:border-white border-black py-[3px] px-6 rounded-3xl text-sm">
            New Features ⚡️{" "}
            <ArrowRight
              className="inline ml-1 pb-[2px] dark:text-white/80 text-slate-600"
              size={20}
            />
          </button>
          <p className="text-center leading-[60px] bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text mt-5 font-bold text-6xl">
            Your Ultimate Form Builder Solution
            {/* <br />
            Craft Dynamic Forms with Ease */}
          </p>
          <p className="mt-4 dark:text-white/80 mb-2 text-black/70  font-normal text-lg">
            Revolutionize Your Form-Building Experience and Redefine Web
            Interaction
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={"/login"}
              className="bg-black  px-8 text-sm py-3  border border-black rounded-3xl cursor-pointer dark:bg-white dark:text-black text-white mt-5"
            >
              Get Started
            </Link>
            <Link
              href={"/login"}
              className="bg-white/20 backdrop-blur-sm  dark:shadow-customlight shadow-custom border-2 dark:border-white border-black  px-8 text-sm py-3 rounded-3xl cursor-pointer font-semibold dark:text-white text-black mt-5"
            >
              Get Started
            </Link>
          </div>
          <div className="relative overflow-hidden p-1 my-10 rounded-2xl">
            <div className="absolute h-[200vh] w-[200vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-2xl overflow-hidden">
              <div className="rotating-border shadow-2xl shadow-teal-200 rounded-[12px] absolute inset-0"></div>
            </div>
            <img
              src="/formeditor.png"
              alt="form editor image"
              className="w-[60vw] relative rounded-2xl  border-4 bg-white p-3 pt-10 mx-auto"
            />
            <div className="w-fit flex flex-row items-center justify-between gap-1 bg-transparent h-5 absolute top-3 left-6">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
        {/* <div>
          <CircleBg />
        </div> */}
      </div>

      <div className="h-fit w-full my-20 p-10">
        <div className="w-full flex flex-row items-start justify-between gap-20">
          <p className="w-3/4 text-left leading-[60px] bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text font-bold text-5xl">
            Create, Integrate, Analyze forms with our formbuilder solution.
          </p>
          <p className="mt-4 w-fit dark:text-white/80 mb-2 text-black/80  font-light text-lg">
            Revolutionize Your Form-Building Experience and Redefine Web
            Interaction
          </p>
        </div>
        <div className="w-full grid grid-cols-3 gap-10 mt-10">
          <CircleBg />

          {features.map((feature) => (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border p-8">
              <div className="flex flex-row items-center gap-3">
                {feature.icon}
                <p className="font-semibold text-xl flex-1"> {feature.title}</p>
              </div>
              <p className="font-light opacity-60 text-sm leading-6">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="h-fit w-full my-20 p-10">
        <div className="w-full flex flex-row items-start justify-between gap-20">
          <p className="w-3/4 text-left leading-[60px] bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text font-bold text-5xl">
            Pricing plans
          </p>
          <p className="mt-4 w-fit dark:text-white/80 text-right mb-2 text-black/80  font-light text-lg">
            Choose a plan that suits your business.
          </p>
        </div>
        <div className="w-full mt-10 grid grid-cols-3 gap-14">
          {pricingPlans.map((feature, index) => (
            <div
              className={cn(
                "flex flex-col relative items-start justify-start gap-10 rounded-2xl border p-8",
                index == 1 &&
                  "scale-110 bg-gradient-to-tl from-teal-400 to-teal-100 text-black/70"
              )}
            >
              <p className="font-semibold text-4xl ">
                {" "}
                {feature.price}{" "}
                <span className="text-2xl opacity-40 inline font-light">
                  /month
                </span>
              </p>
              <p className="font-light opacity-60 text-xl leading-6">
                {feature.shortTitle} plan
              </p>
              <ul>
                {feature.features.map((feat) => (
                  <li className="flex flex-row mb-3 items-center gap-3">
                    <Check
                      color="white"
                      size={25}
                      className="bg-teal-400  p-1 rounded-full text-white"
                    />
                    <p className="font-semibold text-black/60">{feat}</p>
                  </li>
                ))}
              </ul>
              {index == 1 && (
                <p className="bg-gradient-to-tl absolute top-3 right-3 from-yellow-600 to-yellow-300 p-2 text-sm rounded-lg text-white">
                  <FlameIcon size={20} className="inline mr-1" />
                  Popular
                </p>
              )}
              <Button className="">get started now!</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-gradient-to-tl p-10 rounded-2xl from-teal-400 to-teal-100 h-96 flex items-center justify-center">
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to streamline your form management?
          </h2>
          <p className="text-lg text-white mb-8">
            Start using our powerful form builder today and see how easy it is
            to create, integrate, and analyze forms for your business.
          </p>
          <div className="flex justify-center gap-6">
            <a className="bg-white text-black px-8 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300">
              Get Started
            </a>
            <a className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition duration-300">
              View Pricing
            </a>
          </div>
        </div>
      </div>
      <div className="w-full py-20 text-left">
        <div className="max-w-4xl mx-auto ">
          <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
            Why Choose Our Form Builder?
          </h2>
          <p className="text-lg text-gray-700 font-light w-3/4 mx-auto  text-center mb-8">
            Discover the advantages of using our form builder solution to
            enhance your workflow and improve user engagement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-center gap-4">
              <Check
                color="teal"
                size={30}
                className="flex-shrink-0 rounded-full bg-teal-100 text-teal-500 p-2"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Easy Integration
                </h3>
                <p className="text-gray-700">
                  Seamlessly integrate with your favorite tools like Google
                  Sheets, Notion, and more.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check
                color="teal"
                size={30}
                className="flex-shrink-0 rounded-full bg-teal-100 text-teal-500 p-2"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Detailed Analytics
                </h3>
                <p className="text-gray-700">
                  Gain insights into your form performance with advanced
                  analytics and reporting tools.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check
                color="teal"
                size={30}
                className="flex-shrink-0 rounded-full bg-teal-100 text-teal-500 p-2"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Customizable Forms
                </h3>
                <p className="text-gray-700">
                  Build custom forms with an intuitive editor and drag-and-drop
                  functionality.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check
                color="teal"
                size={30}
                className="flex-shrink-0 rounded-full bg-teal-100 text-teal-500 p-2"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure Data Handling
                </h3>
                <p className="text-gray-700">
                  Ensure data security and privacy compliance with our secure
                  form handling practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FormFlowFooter />
    </div>
  );
};

export default page;
