import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SessionWrapper from "@/components/SessionWrapper";
import PlausibleProvider from "next-plausible";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FormFlow - Form building simplified.",
  description:
    "Create, manage, and analyze forms effortlessly with FormFlow. Discover powerful form-building tools designed for individuals and organizations to streamline their workflow.",
  authors: [{ name: "FormFlow" }],
  creator: "FormFlow",
  openGraph: {
    siteName: "FormFlow",
    title: "Simplify Your Form Building and Management - FormFlow",
    description:
      "Create, manage, and analyze forms effortlessly with FormFlow. Discover powerful form-building tools designed for individuals and organizations to streamline their workflow.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Home Page",
      },
    ],
    url: "https://form-x-eight.vercel.app",
  },
  twitter: {
    title: "Simplify Your Form Building and Management - FormFlow",
    description:
      "Create, manage, and analyze forms effortlessly with FormFlow. Discover powerful form-building tools designed for individuals and organizations to streamline their workflow.",
    images: [
      {
        url: "https://form-x-eight.vercel.app/formflow_logo.png",
        alt: "FormFlow Home Page",
      },
    ],
    site: "@formflow",
  },
  alternates: {
    canonical: "https://form-x-eight.vercel.app",
  },
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <PlausibleProvider domain="form-x-eight.vercel.app">
        <html lang="en">
          {/* <Head>
            <script
              defer
              data-domain="form-x-eight.vercel.app"
              src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
            ></script>
            <script>
              window.plausible = window.plausible || function(){" "}
              {(window.plausible.q = window.plausible.q || []).push(arguments)}
            </script>
          </Head> */}
          <body
            className={`${inter.className} w-screen h-screen  overflow-hidden`}
          >
            {children}
            <Toaster />
          </body>
        </html>
      </PlausibleProvider>
    </SessionWrapper>
  );
}

// form-x-eight.vercel.app
