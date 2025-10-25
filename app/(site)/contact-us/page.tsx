// pages/contact.js
import React from "react";
import Navbar from "@/components/Navbar";
import FormFlowFooter from "@/components/Footer";
import { Phone, Mail, MapPin } from "lucide-react";
export const metadata = {
  title: "Contact Us - FormFlow",
  description:
    "Get in touch with the FormFlow team for any inquiries, support, or feedback. We're here to help you with your form-building needs.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Contact Us - FormFlow",
    description:
      "Get in touch with the FormFlow team for any inquiries, support, or feedback. We're here to help you with your form-building needs.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Contact Us Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/contact-us",
  },
  twitter: {
    title: "Contact Us - FormFlow",
    description:
      "Get in touch with the FormFlow team for any inquiries, support, or feedback. We're here to help you with your form-building needs.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Contact Us Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/contact-us",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const page = () => {
  return (
    <div
      className={`w-full font-Lato relative h-screen overflow-y-auto custom-scrollbar z-50 bg-white`}
    >
      <Navbar />
      <div className="px-4 md:px-32 h-fit z-50 w-full my-10 md:my-20 pt-20 md:pt-10 p-10">
        <div className="flex flex-col items-center justify-center gap-10">
          <p className="font-extrabold text-left text-4xl md:text-8xl">
            Contact{" "}
            <span className="underline decoration-teal-400 underline-offset-8">
              Us
            </span>
            .
          </p>
          <div className="w-full md:w-4/5 mt-10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
                <p className="text-gray-700 mb-4">
                  We'd love to hear from you! Whether you have a question about
                  features, pricing, need a demo, or anything else, our team is
                  ready to answer all your questions.
                </p>
                <div className="flex items-center mb-4">
                  <Phone className="text-teal-500 w-6 h-6 mr-2" />
                  <p className="text-gray-700">(123) 456-7890</p>
                </div>
                <div className="flex items-center mb-4">
                  <Mail className="text-teal-500 w-6 h-6 mr-2" />
                  <p className="text-gray-700">contact@formflow.com</p>
                </div>
                <div className="flex items-center mb-4">
                  <MapPin className="text-teal-500 w-6 h-6 mr-2" />
                  <p className="text-gray-700">
                    123 FormFlow St, Form City, FC 12345
                  </p>
                </div>
              </div>
              <div className="flex-1 md:w-fit w-full">
                <form className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border-2 rounded-2xl bg-gray-50 p-5"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="border-2 rounded-2xl bg-gray-50 p-5"
                  />
                  <textarea
                    placeholder="Message"
                    className="border-2 rounded-2xl bg-gray-50 p-5"
                    rows={4}
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-teal-500 text-xl text-white p-5 rounded-2xl"
                  >
                    Submit
                  </button>
                </form>
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
