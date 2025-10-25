"use client";
import FormRenderer from "@/components/FormRender";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = ({ params }: { params: { id: string } }) => {
  const [formJson, setFormJson]: any = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const fetchData = async () => {
    if (!isFetching) {
      try {
        setIsFetching(true);
        const response = await fetch(
          `https://form-x-eight.vercel.app/api/form?form_id=${params.id}&opened_count=1`
        );
        const data = await response.json();
        if (data?.form == null) {
          setIsNotFound(true);
          setIsFetching(false);
          return;
        }
        console.log(data?.form);
        setFormJson(data?.form);
        setIsFetching(false);
      } catch (error) {
        setIsFetching(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (isNotFound) {
    return notFound();
  }

  return (
    <>
      {isFetching ? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <FormRenderer
          preview={false}
          formId={params?.id}
          form={formJson}
          cancelPreview={() => {}}
          fullWidth={false}

        />
      )}
      {formJson &&
        (formJson?.branding == true || formJson?.branding == "true") && (
          <Link
            href={"https://form-x-eight.vercel.app"}
            className="flex flex-row items-center fixed right-5 bottom-5 text-white justify-between gap-1 px-3 py-1 rounded-md bg-teal-500"
          >
            <p className="font-light text-xs">powered by</p>
            <p
              className={`font-extralight font-sans  dark:text-white/50 text-white text-sm`}
            >
              Form{" "}
              <span className="font-serif italic relative right-2 text-lg">
                flow
              </span>
            </p>
          </Link>
        )}
    </>
  );
};

export default Page;
