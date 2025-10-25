import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const IntegrationSection = () => {
  return (
    <div className="w-full py-16 h-fit px-4 md:px-32 pb-20 bg-gray-50">
      <p className="px-4 py-1 rounded-2xl border shadow-custom font-light text-xs  border-black mb-3 w-fit mx-auto bg-white">
        Form Integrations
      </p>
      <p className="text-center text-3xl md:text-5xl font-bold mb-10 bg-gradient-to-b pb-3 from-black to-black/50 text-transparent bg-clip-text">
        Integrations
      </p>
      <div className="flex flex-col md:flex-row justify-around items-stretch gap-10">
        <div className="flex flex-col items-center text-center bg-white shadow-lg rounded-lg p-6 pt-16 pb-12 w-full md:w-1/3">
          <img
            src={"/google-sheet-logo.png"}
            alt="Google Sheets Integration"
            className="w-20 h-20 md:w-40 md:h-40 scale-90 mb-4"
          />
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            Google Sheets
          </h3>
          <p className="text-gray-600 max-w-sm">
            Seamlessly integrate your forms with Google Sheets to automate your
            data collection and management processes.
          </p>
          <Button variant={"outline"} className="w-full mt-10 py-2">
            view docs <ArrowRight className="inline  my-auto ml-2" size={16} />
          </Button>
        </div>
        <div className="flex flex-col items-center text-center bg-white shadow-lg rounded-lg p-6 pt-16 pb-12 w-full md:w-1/3">
          <img
            src={"/notion-logo.png"}
            alt="Notion Integration"
            className="w-20 h-20 md:w-40 md:h-40 mb-4"
          />
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            Notion
          </h3>
          <p className="text-gray-600 max-w-sm">
            Connect your forms with Notion to keep your workflows and databases
            up-to-date in real-time.
          </p>
          <Button variant={"outline"} className="w-full mt-10 py-2">
            view docs <ArrowRight className="inline  my-auto ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSection;
