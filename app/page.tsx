// pages/index.js
import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AboutSection from "@/components/About";
import FormFlowFooter from "@/components/Footer";
import FeaturesSection from "@/components/Features";
import TestimonialsSection from "@/components/Testimonials";
import IntegrationSection from "@/components/Integrations";

const page = () => {
  return (
    <div
      className={`w-full font-Lato relative h-screen overflow-y-auto custom-scrollbar z-50 bg-white`}
    >
      <div className="px-4 md:px-32 min-h-full w-full z-50 relative bg-transparent pb-10">
        <Navbar />
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>{" "}
        <div className="z-50 dark:text-white text-black w-full flex flex-col items-center justify-start pt-36">
          <button className="bg-white/20 backdrop-blur-sm mdLmb-2 border dark:shadow-customlight shadow-custom dark:border-white border-black py-[3px] px-3 md:px-6 rounded-3xl text-xs md:text-sm">
            New Features ⚡️{" "}
            <ArrowRight
              className="inline ml-1 pb-[2px] dark:text-white/80 text-slate-600"
              size={20}
            />
          </button>
          <p className="text-center md:leading-[60px] bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text mt-5 font-bold text-4xl md:text-6xl">
            Your Ultimate Form Builder Solution
          </p>
          <p className="mt-4 dark:text-white/80 md:mb-2 text-black/70 font-normal md:text-lg text-center">
            Revolutionize Your Form-Building Experience and Redefine Web
            Interaction
          </p>
            <Link
              href={"/sign-up"}
              className="bg-black px-8 md:px-12 py-2 md:py-3 border border-black text-lg md:text-xl rounded-3xl md:rounded-[30px] cursor-pointer dark:bg-white dark:text-black text-white mt-5"
            >
              Get Started
            </Link>
          <div className="relative overflow-hidden shadow-2xl border p-1 my-10 rounded-2xl w-full md:w-[60vw]">
            <div className="absolute h-[200vh] w-[200vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-2xl overflow-hidden">
              <div className="rotating-border shadow-2xl shadow-teal-200 rounded-[12px] absolute inset-0"></div>
            </div>
            <img
              src="/formeditor.png"
              alt="form editor image"
              className="w-full relative rounded-2xl bg-white p-3 pt-10 mx-auto"
            />
            <div className="w-fit flex flex-row items-center justify-between gap-1 bg-transparent h-5 absolute top-3 left-6">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>

      <FeaturesSection />
      <IntegrationSection />
      <div className="w-full z-50 bg-gradient-to-tl p-10 from-teal-400 to-teal-100 min-h-96 flex items-center justify-center">
        <div className="max-w-4xl text-center">
          <h2 className="text-xl md:text-4xl font-extrabold md:font-bold mb-6 text-white">
            Ready to streamline your form management?
          </h2>
          <p className="text-base md:text-lg text-white mb-8">
            Start using our powerful form builder today and see how easy it is
            to create, integrate, and analyze forms for your business.
          </p>
          <div className="flex md:flex-row flex-col justify-center gap-2 md:gap-6">
            <a className="bg-white text-black px-8 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300">
              Get Started
            </a>
            <a className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition duration-300">
              View Pricing
            </a>
          </div>
        </div>
      </div>
      <TestimonialsSection />
      <FormFlowFooter />
    </div>
  );
};

export default page;
