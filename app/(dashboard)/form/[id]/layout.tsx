import React from "react";

export const metadata = {
  title: "Form Details - FormFlow",
  description:
    "View detailed information about your forms in FormFlow. Analyze responses, manage settings, and optimize your forms for better engagement.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Form Details - FormFlow",
    description:
      "View detailed information about your forms in FormFlow. Analyze responses, manage settings, and optimize your forms for better engagement.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_form_details.png",
        alt: "FormFlow Form Details Page",
      },
    ],
    url: "https://form-x-eight.vercel.app/forms/details",
  },
  twitter: {
    title: "Form Details - FormFlow",
    description:
      "View detailed information about your forms in FormFlow. Analyze responses, manage settings, and optimize your forms for better engagement.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_form_details.png",
        alt: "FormFlow Form Details Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app/forms/details",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full overflow-y-scroll custom-scrollbar">
      {children}
    </div>
  );
};

export default layout;
