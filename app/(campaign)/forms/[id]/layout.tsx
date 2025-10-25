import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export const generateMetadata = async ({ params }: any): Promise<Metadata> => {
  const response = await fetch(
    `https://form-x-eight.vercel.app/api/form?form_id=${params.id}`,
    {
      method: "GET",
      cache: "no-cache",
    }
  );

  const { form } = await response.json();

  return {
    title: `${form?.title || 'Not Found'} - FormFlow`,
    description: form?.description || 'Form not found',
    authors: [{ name: "FormFlow" }],
    creator: "FormFlow",
    openGraph: {
      siteName: "FormFlow",
      title: `${form?.title} - FormFlow`,
      description: form?.description,
      images: [
        {
          url: "https://form-x-eight.vercel.app/formflow_logo.png",
          alt: "FormFlow Published Form Page",
        },
      ],
      url: `https://form-x-eight.vercel.app/forms/${params.id}`,
    },
    twitter: {
      title: `${form?.title} - FormFlow`,
      description: form?.description,
      images: [
        {
          url: "https://form-x-eight.vercel.app/formflow_logo.png",
          alt: "FormFlow Published Form Page",
        },
      ],
      site: "@formflow",
    },
    alternates: {
      canonical: `https://form-x-eight.vercel.app/forms/${params.id}`,
    },
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  };
};
const layout = async ({ children }: { children: React.ReactNode }) => {
  const session: any = await getServerSession();
  if (session && !session.user) {
    redirect("/login");
  }
  return (
    <div className="relative w-screen h-screen ">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      {children}
    </div>
  );
};

export default layout;
