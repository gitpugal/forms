import React from "react";
import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const FormFlowFooter = () => {
  return (
    <footer id="contact" className="bg-gray-900 relative z-50 text-gray-300 py-12">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#009688_100%)]"></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">FormFlow</h2>
            <p className="text-gray-400 mb-4">
              Revolutionizing form management with intuitive tools and powerful
              analytics.
            </p>
            <div className="flex gap-4">
              <Twitter
                size={24}
                className="text-gray-400 hover:text-white transition duration-300"
              />
              <Facebook
                size={24}
                className="text-gray-400 hover:text-white transition duration-300"
              />
              <Instagram
                size={24}
                className="text-gray-400 hover:text-white transition duration-300"
              />
              <Linkedin
                size={24}
                className="text-gray-400 hover:text-white transition duration-300"
              />
            </div>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul>
              <li>
                <Link href="/features">
                  <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                    Features
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                    Pricing
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                    About Us
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                    Contact Us
                  </p>
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul>
              <li>
                <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                  Documentation
                </p>
              </li>
              <li>
                <p className="text-gray-400 hover:text-white transition duration-300 cursor-pointer">
                  Blog
                </p>
              </li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <p className="text-gray-400 mb-4">
              Address, City, Country <br />
              Phone: +123 456 789 <br />
              Email: info@formflow.com
            </p>
          </div>
        </div>
        <hr className="border-gray-600 my-8" />
        <div className="text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} FormFlow. All rights reserved.
          </p>
          <p className="mt-2">
            Designed and developed with{" "}
            <span role="img" aria-label="love">
              ❤️
            </span>{" "}
            <span className="font-semibold">Matrixleaf</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FormFlowFooter;
