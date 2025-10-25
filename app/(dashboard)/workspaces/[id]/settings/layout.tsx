import React from "react";
export const metadata = {
  title: "Workspace Settings - FormFlow",
  description:
    "Customize your workspace settings in FormFlow. Update workspace details, configure integrations, and manage preferences.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Workspace Settings - FormFlow",
    description:
      "Customize your workspace settings in FormFlow. Update workspace details, configure integrations, and manage preferences.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_workspace_settings.png",
        alt: "FormFlow Workspace Settings Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/workspace/settings",
  },
  twitter: {
    title: "Workspace Settings - FormFlow",
    description:
      "Customize your workspace settings in FormFlow. Update workspace details, configure integrations, and manage preferences.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_workspace_settings.png",
        alt: "FormFlow Workspace Settings Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/workspace/settings",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default layout;
