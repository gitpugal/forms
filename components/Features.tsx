// components/Features.js
import React from "react";
import { Grid, Users, Edit, BarChart2, Table, Zap } from "lucide-react";

const features = [
  {
    title: "Centralized Workspaces",
    description:
      "Manage all your forms in one place by creating workspaces. Easily create multiple forms and organize projects efficiently. Invite members, assign roles, and collaborate seamlessly.",
    icon: <Grid className="text-white " size={30} />,
  },
  {
    title: "Collaborative Team Management",
    description:
      "Add and manage team members. Assign roles to ensure everyone has the right access. Work together in real-time to create, edit, and manage forms.",
    icon: <Users className="text-white " size={30} />,
  },
  {
    title: "Intuitive Block-Style Editor",
    description:
      "Build and customize forms with our user-friendly editor. Drag and drop elements to create professional forms quickly. Publish and share forms effortlessly.",
    icon: <Edit className="text-white " size={30} />,
  },
  {
    title: "Comprehensive Form Analytics",
    description:
      "Track form performance with detailed analytics. Monitor metrics like open rates and submissions to optimize forms and improve user engagement.",
    icon: <BarChart2 className="text-white " size={30} />,
  },
  {
    title: "Detailed Response Management",
    description:
      "View and manage form responses in an organized table. Filter and analyze responses to make informed decisions. Export data for further analysis.",
    icon: <Table className="text-white " size={30} />,
  },
  {
    title: "Seamless Integrations",
    description:
      "Integrate forms with popular services like Google Sheets and Notion. Automatically update data in real-time to enhance workflow and keep everything in sync.",
    icon: <Zap className="text-white " />,
  },
];

const FeaturesSection = () => {
  return (
    <div className="w-full overflow-hidden  relative py-16 ">
            <div className="w-72 h-72 z-[-200] rounded-full bg-teal-400 bottom-20 left-0 md:left-36  absolute "></div>

      <p className="text-center text-3xl md:text-5xl font-bold mb-10 bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text">
        Features
      </p>
      <div className="w-96 h-96 z-[-200] rounded-full bg-teal-400 top-1/2 -translate-y-1/2 left-1/2  absolute "></div>
      <div className="grid grid-cols-1  px-4 md:px-32 md:grid-cols-3 gap-10 bg-white/70 backdrop-blur-3xl">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-transparent rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105"
          >
            <div className="flex items-center mb-4 gap-4">
              <div className="flex items-center justify-center w-16 h-16 p-3 rounded-full bg-teal-400">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold ml-2 flex-1 ">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-700 text-sm md:text-base font-light">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
