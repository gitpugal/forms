// pages/pricing.js
import React from "react";
import Navbar from "@/components/Navbar";
import { Check, FlameIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormFlowFooter from "@/components/Footer";

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

const faqs = [
  {
    question: "What is included in the free plan?",
    answer:
      "The free plan allows you to create and manage basic forms with up to 10 responses per month. It also includes standard support.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time directly from your account settings.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes, we offer standard support for all plans, and priority support for the Pro plan.",
  },
];

export const metadata = {
  title: "Pricing Plans - FormFlow",
  description:
    "Explore FormFlow's pricing plans and choose the one that fits your needs. Compare features and benefits to get the best value.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Pricing Plans - FormFlow",
    description:
      "Explore FormFlow's pricing plans and choose the one that fits your needs. Compare features and benefits to get the best value.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Pricing Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/pricing",
  },
  twitter: {
    title: "Pricing Plans - FormFlow",
    description:
      "Explore FormFlow's pricing plans and choose the one that fits your needs. Compare features and benefits to get the best value.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Pricing Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/pricing",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const page = () => {
  return (
    <div
      className={`w-full font-Lato relative h-full overflow-y-auto custom-scrollbar z-50 bg-white`}
    >
      <Navbar />
      <div className="px-4 md:px-32 h-fit z-50 w-full my-10 md:my-20 p-10">
        <div className="flex flex-col items-center justify-center gap-10">
          <p className="w-full md:w-3/4 text-center md:leading-[60px] bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text font-bold text-3xl md:text-5xl">
            Choose the plan that suits you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4 md:mt-10 w-full md:w-4/5">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`flex  bg-white flex-col items-center justify-between gap-4 rounded-2xl border p-8 relative ${
                  index == 1 && "shadow-2xl scale-110"
                }`}
              >
                <div className="absolute right-4 top-4">
                  {plan.shortTitle === "Basic" ? (
                    <FlameIcon
                      className="inline bg-red-400 bg-clip-text pb-[2px] text-orange-600"
                      size={30}
                      fill="orange"
                    />
                  ) : null}
                </div>
                <div className="flex flex-row items-center gap-3">
                  <p className="font-bold text-5xl flex-1"> {plan.price}</p>
                </div>
                <p className="font-light text-base text-center">
                  {plan.shortTitle}
                </p>
                <div className="w-full flex flex-col items-start justify-center gap-1 mt-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex flex-row items-center gap-2">
                      <Check size={20} className="text-teal-400" />
                      <p className="font-light text-sm text-start">{feature}</p>
                    </div>
                  ))}
                </div>
                <Button className="mt-5 w-full">Get Started</Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Benefits Section */}
      <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4 md:px-32">
          <h2 className="text-4xl font-bold text-center text-teal-500 mb-10">
            Why Choose Our Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-xl">
              <div className="w-24 h-24 mb-4 bg-teal-400 rounded-full flex items-center justify-center">
                <svg
                  className="text-white w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Affordable</h3>
              <p className="mt-2 text-gray-600">
                Our pricing plans are designed to be affordable and cater to all
                types of users, from individuals to large organizations.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-xl">
              <div className="w-24 h-24 mb-4 bg-teal-400 rounded-full flex items-center justify-center">
                <svg
                  className="text-white w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Feature-Rich</h3>
              <p className="mt-2 text-gray-600">
                Get access to a wide range of features that help you create and
                manage forms effortlessly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white shadow-md rounded-xl">
              <div className="w-24 h-24 mb-4 bg-teal-400 rounded-full flex items-center justify-center">
                <svg
                  className="text-white w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.55 2.6-4.55 2.6V10z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Flexible</h3>
              <p className="mt-2 text-gray-600">
                Our plans are flexible, allowing you to upgrade or downgrade at
                any time to suit your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-32">
          <h2 className="text-4xl font-bold text-center text-teal-500 mb-10">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col items-center">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="w-full md:w-3/4 p-4 mb-4 bg-white shadow-md rounded-xl"
              >
                <h3 className="text-xl font-semibold text-teal-400">
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FormFlowFooter />
    </div>
  );
};

export default page;
