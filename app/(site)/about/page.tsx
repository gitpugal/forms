// pages/about.js
import React from "react";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/About";
import FormFlowFooter from "@/components/Footer";
import { CheckCircle, Users, Award, Briefcase } from "lucide-react";

export const metadata = {
  title: "About Us - FormFlow",
  description:
    "Learn more about FormFlow, our mission, vision, and the team behind the powerful form-building and management tools.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "About Us - FormFlow",
    description:
      "Learn more about FormFlow, our mission, vision, and the team behind the powerful form-building and management tools.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow About Us Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/about",
  },
  twitter: {
    title: "About Us - FormFlow",
    description:
      "Learn more about FormFlow, our mission, vision, and the team behind the powerful form-building and management tools.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow About Us Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/about",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const page = () => {
  return (
    <div
      className={`w-full overflow-x-hidden font-Lato relative h-full overflow-y-auto custom-scrollbar z-50 bg-white`}
    >
      <Navbar />
      <AboutSection />
      <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4 md:px-32">
          <h2 className="text-4xl font-bold text-center text-teal-700 mb-10">
            Our Vision & Mission
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mb-4 mx-auto bg-teal-400 rounded-full flex items-center justify-center">
                <Award className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Vision</h3>
              <p className="text-gray-700 w-3/4 mx-auto">
                To revolutionize form-building by providing intuitive and
                powerful tools that empower individuals and organizations to
                seamlessly create and manage online forms.
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mb-4 mx-auto bg-teal-400 rounded-full flex items-center justify-center">
                <Briefcase className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-light text-teal-600 mb-4">Mission</h3>
              <p className="text-gray-700 w-3/4 mx-auto">
                Our mission is to enhance user experience and streamline form
                management by integrating innovative features, robust analytics,
                and seamless integrations with other services.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-32">
          <h2 className="text-4xl font-bold text-center text-teal-700 mb-10">
            Our Achievements
          </h2>
          <div className="flex flex-col w-full md:w-3/4 mx-auto items-center text-center p-6 bg-white shadow-md rounded-xl">
            <CheckCircle className="text-teal-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">10K+ Forms Created</h3>
            <p className="mt-2 text-gray-600">
              Helping thousands of users to create and manage their forms
              effortlessly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full md:w-3/4 mt-5 mx-auto gap-5">
            <div className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-xl">
              <Award className="text-teal-500 w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold">Award Winning</h3>
              <p className="mt-2 text-gray-600">
                Recognized for our innovative approach in the industry.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-xl">
              <Briefcase className="text-teal-500 w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold">Global Reach</h3>
              <p className="mt-2 text-gray-600">
                Serving clients from all around the world.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FormFlowFooter />
    </div>
  );
};

export default page;
