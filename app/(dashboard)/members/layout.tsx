import React from "react";
export const metadata = {
  title: "Workspace Members - FormFlow",
  description:
    "Manage your workspace members in FormFlow. Add, remove, and assign roles to collaborate efficiently with your team.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Workspace Members - FormFlow",
    description:
      "Manage your workspace members in FormFlow. Add, remove, and assign roles to collaborate efficiently with your team.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_workspace_members.png",
        alt: "FormFlow Workspace Members Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/workspace/members",
  },
  twitter: {
    title: "Workspace Members - FormFlow",
    description:
      "Manage your workspace members in FormFlow. Add, remove, and assign roles to collaborate efficiently with your team.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_workspace_members.png",
        alt: "FormFlow Workspace Members Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/workspace/members",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full">{children}</div>;
};

export default layout;
