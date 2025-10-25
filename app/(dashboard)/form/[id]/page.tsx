"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import forms from "@/app/services/forms";
import {
  EyeOff,
  Link,
  Loader2,
  Loader2Icon,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ColumnDef } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import randomUUID from "uuid-random";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
const Editor = dynamic(() => import("@/components/Editorjs/Editor"), {
  ssr: false,
});
export type FormResponse = {
  id: string;
  name: string;
  email: string;
  message: string;
};

const Page = ({ params }: { params: { id: string } }) => {
  const generateFormResponseColumns = (
    formResponses: FormResponse[]
  ): ColumnDef<FormResponse>[] => {
    console.log(formResponses);
    // Initialize an empty array to store unique field names
    const uniqueFields: any[] = [];
    let count = 1;
    // Iterate through form responses to extract unique field names
    formResponses?.forEach((response: any) => {
      Object.keys(response.responses).forEach((field: any) => {
        // Check if the field is not already in the uniqueFields array
        if (!uniqueFields.find((f: any) => f?.name == field)) {
          if (field == "") {
            uniqueFields.push({ name: "Untitled field " + count, key: field });
            count += 1;
          } else {
            uniqueFields.push({ name: field, key: field });
          }
        }
      });
    });

    console.log(uniqueFields);

    // Generate columns based on unique field names
    const columns: ColumnDef<FormResponse>[] = uniqueFields.map((field) => ({
      accessorKey: `${field.key}`,
      accessorFn: (row: any) => row.responses[field.key],
      header: field.name.charAt(0).toUpperCase() + field.name.slice(1), // Capitalize the field name
    }));

    return columns;
  };
  // State for storing form response data
  const session: any = useSession();
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [isFetching, setisFetching] = useState(false);
  const [isSavingSettings, setisSavingSettings] = useState(false);

  const [isIntegrating, setisIntegrating] = useState(false);
  const [isPreviewing, setisPreviewing] = useState(false);
  const [currentForm, setcurrentForm]: any = useState(null);
  const [currentWorkspace, setcurrentWorkspace]: any = useState(null);
  const [curFormFieldLen, setcurFormFieldLen] = useState(0);
  const router = useRouter();
  const [isSettingChanged, setIsSettingChnaged] = useState(false);
  // Fetch actual form response data from your backend or wherever it's stored
  const fetchFormResponses = async () => {
    setisFetching(true);
    // Example: Fetch form responses from an API endpoint
    const response = await fetch(
      `/api/form_responses?form_id=${
        currentForm ? currentForm?.form_id : params?.id
      }`
    );
    if (!response.ok) {
      setisFetching(false);
      throw new Error("Failed to fetch form responses");
    }
    const responseData = await response.json();
    setisFetching(false);
    return responseData.formResponses;
  };

  const fetchData = async () => {
    fetchFormResponses()
      .then((data) => {
        console.log(data);
        setFormResponses(data);
      })
      .catch((error) => {
        console.error("Error fetching form responses:", error);
      });
  };

  useEffect(() => {
    if (formResponses) {
      const formResponseColumns = generateFormResponseColumns(formResponses);
      console.log(formResponseColumns);
      console.log(formResponses);
      setColumns(formResponseColumns);
    }
  }, [formResponses]);

  const saveSettings = async () => {
    setisSavingSettings(true);
    try {
      const newapitoken = randomUUID();
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/save-form-settings",
        {
          method: "POST",
          body: JSON.stringify({
            ...currentForm,
            ...settingsData,
            api_key: settingsData?.api_enabled
              ? currentForm?.api_enabled
                ? settingsData?.api_key
                : newapitoken
              : null,
            form_id: currentForm?.form_id,
          }),
        }
      );
      if (response.ok) {
        setisSavingSettings(false);
        setIsSettingChnaged(false);
        toast({
          title: "Sucess",
          description: "Form changes saved successfully!",
          duration: 5000,
        });
        console.log(currentForm);
        console.log(settingsData);
        setcurrentForm((prev: any) => ({
          ...prev,
          ...settingsData,
          api_key: settingsData?.api_enabled
            ? currentForm?.api_enabled
              ? settingsData?.api_key
              : newapitoken
            : null,
        }));
        setSettingsData((prev: any) => ({
          ...prev,
          api_key: settingsData?.api_enabled
            ? currentForm?.api_enabled
              ? settingsData?.api_key
              : newapitoken
            : null,
        }));
      }
    } catch (error) {
      console.log("catch err: ", error);
      setisSavingSettings(false);

      toast({
        title: "Error",
        description:
          "Uh oh, an error occured while saving the form, Try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const [activeTab, setActiveTab] = useState("settings");

  const [slideStyle, setSlideStyle] = useState({});
  const [isPublishing, setisPublishing] = useState(false);
  const [columns, setColumns]: any = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [fetching, setFetching] = useState(false);
  const formServive = new forms();
  const { toast } = useToast();
  const [settingsData, setSettingsData]: any = useState({});
  const tabRefs = useRef<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const { offsetLeft, offsetWidth } = tabRefs.current[activeTab];
      setSlideStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  const publishForm = async () => {
    try {
      setisPublishing(true);
      const response = await formServive.publishForm(
        currentForm?.form_id,
        !currentForm?.published
      );
      console.log(response);
      let currentStatus = !currentForm?.published;
      setcurrentForm((prev: any) => ({
        ...prev,
        published: !currentForm?.published,
      }));
      setisPublishing(false);

      toast({
        title: `Form ${currentStatus ? "Published" : "Unpublished"}`,
        description: `Form is ${
          currentStatus ? "Published" : "Unpublished"
        } successfully !`,
      });
    } catch (error) {
      setisPublishing(false);
      toast({
        title: "An error occured",
        description: "Cannot publish form now. Try again later!",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const copyToClipBoard = (text: string) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setTimeout(() => {
            setCopied(false);
            setisAPIcopied(false);
          }, 2000);
          toast({
            title: "link copied to clip board",
            duration: 2000,
          });
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  const handleSignIn = async () => {
    try {
      setisIntegrating(true);
      const respinse = await fetch("https://form-x-eight.vercel.app/api/get-auth-url", {
        method: "POST",
        body: JSON.stringify({ form_id: currentForm?.form_id }),
      });
      const data = await respinse.json();
      console.log(data);
      if (window && data?.url) {
        router.push(data.url);
      }

      setisIntegrating(false);
    } catch (error) {
      toast({
        title: "An error occurred, Try again later.",
        duration: 2000,
        variant: "destructive",
      });
      setisIntegrating(false);
      console.error("Error during sign in:", error);
    }
  };

  const changeAPIkey = async () => {
    const newapitoken = randomUUID();
    setIsLoading(true);
    setSettingsData((prev: any) => ({ ...prev, api_key: newapitoken }));
    setIsSettingChnaged(true);
    setIsLoading(false);
  };

  const openProModal = () => {
    // localStorage?.setItem("formflowpromodal", "true");
    const event: any = new Event("storage");
    event.key = "formflowpromodal";
    event.newValue = "true";
    window.dispatchEvent(event);
  };
  const renderContent = (json: any) => {
    switch (activeTab) {
      case "response":
        return (
          <div className="w-full md:max-w-[70vw]  relative  py-10">
            <Button
              disabled={isFetching}
              onClick={fetchData}
              className="mb-5 text-sm"
            >
              <RefreshCcw className="inline mr-1" size={17} />
              Refresh
            </Button>
            {isFetching ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <DataTable
                columns={columns}
                data={formResponses?.length > 0 ? formResponses : []}
              />
            )}
          </div>
        );
      case "analytics":
        return (
          <div className="grid gap-8 w-full md:grid-cols-2 lg:grid-cols-3 pb-10">
            <Card className="bg-[#f5f5f5] pb-2  px-2 rounded-2xl border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                <CardTitle className="text-sm font-medium">
                  Impressions
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                {!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false" ? (
                  <div
                    onClick={() => {
                      openProModal();
                    }}
                    className="text-5xl cursor-pointer font-bold w-fit px-5 py-2 relative z-0"
                  >
                    :&#41;
                    <div className="h-full w-full text-white flex items-center justify-center absolute top-0 z-10 left-0 bg-black/10 rounded-lg backdrop-blur-lg">
                      <EyeOff className="opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-bold">
                    {currentForm?.opened_count || 0}
                  </div>
                )}
                <p
                  className={`text-xs text-muted-foreground ${
                    (!session?.data?.user?.pro ||
                      session?.data?.user?.pro == "false") &&
                    "mt-2"
                  }`}
                >
                  live analytics
                </p>
                {(!session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false") && (
                  <NextLink
                    href={"/settings/profile#pricing"}
                    className="underline text-xs mt-0 p-0 underline-offset-1"
                  >
                    subscribe now -&gt;
                  </NextLink>
                )}
              </CardContent>
            </Card>
            <Card className="bg-[#f5f5f5] pb-2  px-2 rounded-2xl border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                <CardTitle className="text-sm font-medium">
                  Submissions
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                {!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false" ? (
                  <div
                    onClick={() => {
                      openProModal();
                    }}
                    className="text-5xl cursor-pointer font-bold w-fit px-5 py-2 relative z-0"
                  >
                    :&#41;
                    <div className="h-full w-full text-white flex items-center justify-center absolute top-0 z-10 left-0 bg-black/10 rounded-lg backdrop-blur-lg">
                      <EyeOff className="opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-bold">
                    {currentForm?.submitted_count || 0}
                  </div>
                )}
                <p
                  className={`text-xs text-muted-foreground ${
                    (!session?.data?.user?.pro ||
                      session?.data?.user?.pro == "false") &&
                    "mt-2"
                  }`}
                >
                  live analytics
                </p>{" "}
                {(!session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false") && (
                  <NextLink
                    href={"/settings/profile#pricing"}
                    className="underline text-xs mt-0 p-0 underline-offset-1"
                  >
                    subscribe now -&gt;
                  </NextLink>
                )}
              </CardContent>
            </Card>
            <Card className="bg-[#f5f5f5] pb-2  px-2 rounded-2xl border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                <CardTitle className="text-sm font-medium">
                  API Submissions
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                {!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false" ? (
                  <div
                    onClick={() => {
                      openProModal();
                    }}
                    className="text-5xl  cursor-pointerfont-bold w-fit px-5 py-2 relative z-0"
                  >
                    :&#41;
                    <div className="h-full w-full text-white flex cursor-pointer items-center justify-center absolute top-0 z-10 left-0 bg-black/10 rounded-lg backdrop-blur-lg">
                      <EyeOff className="opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-bold">
                    {currentForm?.api_submitted_count || 0}
                  </div>
                )}
                <p
                  className={`text-xs text-muted-foreground ${
                    (!session?.data?.user?.pro ||
                      session?.data?.user?.pro == "false") &&
                    "mt-2"
                  }`}
                >
                  live analytics
                </p>{" "}
                {(!session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false") && (
                  <NextLink
                    href={"/settings/profile#pricing"}
                    className="underline text-xs mt-0 p-0 underline-offset-1"
                  >
                    subscribe now -&gt;
                  </NextLink>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case "integrations":
        return (
          <>
            <div className="w-full flex flex-col items-start justify-start gap-5 mb-10 ">
              <p className="text-xl font-semibold">Integrations</p>
              {currentForm?.integrations &&
                Object?.entries(currentForm?.integrations)?.map((val: any) => (
                  <div className="w-full flex relative bg-white border rounded-md p-5 flex-row items-center justify-between gap-5">
                    {val[0] == "notion" &&
                      currentForm &&
                      currentForm?.integrations?.notion?.database_mappings
                        ?.length < curFormFieldLen && (
                        <>
                          <div className="w-5 h-5 bg-orange-500 animate-ping rounded-full absolute -top-2 -right-2"></div>
                          <div className="w-5 h-5 bg-orange-500 rounded-full absolute -top-2 -right-2"></div>
                        </>
                      )}
                    <div className="flex flex-row items-center justify-between gap-3">
                      <p className="font-semibold">
                        {val[0].slice(0, 1).toUpperCase()}
                        {val[0].slice(1, val[0].length)}{" "}
                      </p>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    {val[0] == "google" && (
                      <div className="flex flex-row items-center justify-between gap-3">
                        <NextLink
                          href={`https://docs.google.com/spreadsheets/d/${val[1]?.sheetId}`}
                          target="_blank"
                          className="underline"
                        >
                          go to sheets
                        </NextLink>
                        <Link
                          className={`${
                            copied
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-500"
                          } border p-2 rounded-md h-10 w-10 cursor-pointer `}
                          onClick={() => {
                            setCopied(true);
                            copyToClipBoard(
                              `https://docs.google.com/spreadsheets/d/${val[1]?.sheetId}`
                            );
                          }}
                        />
                      </div>
                    )}
                    {val[0] == "notion" &&
                      currentForm &&
                      currentForm?.integrations?.notion?.database_mappings
                        ?.length < curFormFieldLen && (
                        <div className="flex flex-row items-center justify-between gap-3">
                          <p
                            // href={`https://docs.google.com/spreadsheets/d/${val[1]?.sheetId}`}
                            // target="_blank"
                            className="text-sm text-red-500 font-semibold opacity-60"
                          >
                            Your notion tables headers aren't synced !
                            <br />
                            <span className="text-xs font-light">
                              {"("}please add or create the new column headers
                              in your notion table{")"}
                            </span>
                          </p>
                          <NextLink
                            href={`https://form-x-eight.vercel.app/notion?token=${currentForm?.integrations?.notion?.token}&state=${currentForm?.form_id}`}
                          >
                            <Button>Map new fields</Button>
                          </NextLink>
                        </div>
                      )}
                  </div>
                ))}
            </div>
            <div className="grid gap-8 w-full md:grid-cols-2 lg:grid-cols-3 pb-10">
              <Card className="bg-[#f5f5f5] pb-2  px-2 rounded-2xl border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-lg text-[#0f0f0f] font-medium">
                    Google sheet
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <Button
                    className=" bg-green-500 hover:bg-green-600"
                    onClick={handleSignIn}
                    disabled={
                      !session?.data?.user?.pro ||
                      session?.data?.user?.pro == "false" ||
                      isIntegrating
                    }
                  >
                    {isIntegrating && (
                      <Loader2Icon className="animate-spin mr-2" size={16} />
                    )}{" "}
                    Connect to Google Sheets
                  </Button>
                  {(!session?.data?.user?.pro ||
                    session?.data?.user?.pro == "false") && (
                    <NextLink href={"/settings/profile#pricing"}>
                      <p className="text-red-600 font-light mt-1 text-xs">
                        You must be an pro member to access this feature{" "}
                        <span className="text-black underline-offset-1 underline">
                          subscribe now -&gt;
                        </span>
                      </p>
                    </NextLink>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-[#f5f5f5] pb-2  px-2 rounded-2xl border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-lg text-[#0f0f0f] font-medium">
                    Notion
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => {
                      router.push(
                        `https://api.notion.com/v1/oauth/authorize?client_id=1fb8f6c9-5e73-4c85-9351-5464b2ed2983&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fform-x-eight.vercel.app%2Fnotion&state=${currentForm?.form_id}`
                      );
                    }}
                    disabled={
                      !session?.data?.user?.pro ||
                      session?.data?.user?.pro == "false"
                    }
                    className="text-white bg-[#343434] text-sm scale-105 rounded-md py-[8px] px-[16px]"
                  >
                    Connect to notion
                  </button>
                  {(!session?.data?.user?.pro ||
                    session?.data?.user?.pro == "false") && (
                    <NextLink href={"/settings/profile#pricing"}>
                      <p className="text-red-600 font-light mt-1 text-xs">
                        You must be an pro member to access this feature{" "}
                        <span className="text-black underline-offset-1 underline">
                          subscribe now -&gt;
                        </span>
                      </p>
                    </NextLink>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        );
      case "settings":
        return (
          <div className="w-full  mx-auto relative  py-10 space-y-10">
            <div className="w-full">
              {(!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false") && (
                <NextLink href={"/settings/profile#pricing"}>
                  <p className="text-red-600 font-semibold text-xs">
                    *You must be an pro member to access this feature{" "}
                    <span className="text-black underline-offset-1 underline">
                      subscribe now -&gt;
                    </span>
                  </p>
                </NextLink>
              )}
              <div
                className={`flex flex-col md:flex-row items-start md:items-end border-b border-black/5 pb-2 justify-between gap-3 ${
                  !session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false"
                    ? "pointer-events-none"
                    : ""
                } `}
              >
                <div className="">
                  <p className=" flex-1 font-semibold opacity-70">
                    Show Form flow branding
                  </p>
                  <p className="text-xs font-light">
                    Turn off or on form flow branding in your forms to build
                    your business credibility.
                  </p>
                </div>

                <div className="font-light flex w-fit  flex-row items-center justify-end gap-1">
                  Enable
                  <Switch
                    checked={
                      settingsData?.branding != null
                        ? settingsData?.branding
                        : currentForm?.branding
                    }
                    onCheckedChange={(e) => {
                      if (
                        !session?.data?.user?.pro ||
                        session?.data?.user?.pro == "false"
                      ) {
                        toast({
                          title: "Join pro membership",
                          description:
                            "You must be an pro member to access this feature",
                          variant: "destructive",
                        });
                      } else {
                        setSettingsData((prev: any) => ({
                          ...prev,
                          branding: e,
                        }));
                        setIsSettingChnaged(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="w-full border-b pb-6 ">
              <div className="flex flex-col md:flex-row items-start md:items-end   border-black/5 justify-between gap-3">
                <div className="">
                  <p className=" flex-1 font-semibold opacity-70">
                    Redirect URL
                  </p>
                  <p className="text-xs font-light">
                    Enable and provide an redirect URL for redirecting user
                    after form submission.
                  </p>
                </div>

                <div className="font-light flex w-fit  flex-row items-center justify-end gap-1">
                  Enable
                  <Switch
                    checked={
                      settingsData?.redirect != null
                        ? settingsData?.redirect
                        : currentForm?.redirect
                    }
                    onCheckedChange={(e) => {
                      setSettingsData((prev: any) => ({
                        ...prev,
                        redirect: e,
                      }));
                      setIsSettingChnaged(true);
                    }}
                  />
                </div>
              </div>
              {settingsData?.redirect && (
                <Input
                  type="text"
                  value={
                    settingsData?.redirect_url
                      ? settingsData?.redirect_url
                      : currentForm?.redirect_url
                  }
                  placeholder="Enter redirect URL"
                  className="flex-1 mt-5"
                  onChange={(e) => {
                    setSettingsData((prev: any) => ({
                      ...prev,
                      redirect_url: e?.target?.value,
                    }));
                  }}
                  disabled={!settingsData?.redirect}
                />
              )}
            </div>
            <div className="w-full border-b pb-6 ">
              <div className="flex flex-col md:flex-row items-start md:items-end   border-black/5 justify-between gap-3">
                <div className="">
                  <p className=" flex-1 font-semibold opacity-70">
                    Make this form public
                  </p>
                  <p className="text-xs font-light">
                    If you enable this option, your template will be visible
                    formflow global free templates in view only mode.
                  </p>
                </div>

                <div className="font-light flex w-fit  flex-row items-center justify-end gap-1">
                  Enable
                  <Switch
                    checked={
                      settingsData?.public != null
                        ? settingsData?.public
                        : currentForm?.public
                    }
                    onCheckedChange={(e) => {
                      setSettingsData((prev: any) => ({
                        ...prev,
                        public: e,
                      }));
                      setIsSettingChnaged(true);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              {(!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false") && (
                <NextLink href={"/settings/profile#pricing"}>
                  <p className="text-red-600 font-semibold text-xs">
                    *You must be an pro member to access this feature{" "}
                    <span className="text-black underline-offset-1 underline">
                      subscribe now -&gt;
                    </span>
                  </p>
                </NextLink>
              )}
              <div
                className={`flex flex-col md:flex-row items-start md:items-end border-b pb-2 border-black/5 justify-between gap-3  ${
                  !session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false"
                    ? "pointer-events-none"
                    : ""
                }`}
              >
                <div>
                  <p className=" flex-1 font-semibold opacity-70">
                    Notify Email
                  </p>
                  <p className="text-xs font-light">
                    Enable email notification for form submissions.
                  </p>
                </div>
                <div className="font-light flex md:w-1/2 md:mr-0 mr-auto  flex-row items-center justify-end gap-1 ">
                  Enable
                  <Switch
                    checked={
                      settingsData?.email_notify != null
                        ? settingsData?.email_notify
                        : currentForm?.email_notify
                    }
                    onCheckedChange={(e) => {
                      if (
                        !session?.data?.user?.pro ||
                        session?.data?.user?.pro == "false"
                      ) {
                        toast({
                          title: "Join pro membership",
                          description:
                            "You must be an pro member to access this feature",
                          variant: "destructive",
                        });
                      } else {
                        setSettingsData((prev: any) => ({
                          ...prev,
                          email_notify: e,
                        }));
                        setIsSettingChnaged(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-end border-b pb-2 border-black/5 justify-between gap-3">
              <div>
                <p className=" flex-1 font-semibold opacity-70">
                  Close form submissions
                </p>
                <p className="text-xs font-light">
                  Close form submissions to this form temporarily.
                </p>
              </div>
              <div className="font-light flex md:w-1/2  md:mr-0 mr-auto flex-row items-center justify-end gap-1">
                Enable
                <Switch
                  checked={
                    settingsData?.closed != null
                      ? settingsData?.closed
                      : currentForm?.closed
                  }
                  onCheckedChange={(e) => {
                    setSettingsData((prev: any) => ({
                      ...prev,
                      closed: e,
                    }));
                    setIsSettingChnaged(true);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-end border-b pb-2 border-black/5 justify-between gap-3">
              <div>
                <p className=" flex-1 font-semibold opacity-70">
                  Submission limit
                </p>
                <p className="text-xs font-light">
                  Set submission count limit / per user{"(per IP Adresss)."}
                </p>
              </div>
              <div className="font-light flex flex-1 flex-col items-end justify-end gap-1">
                <Input
                  type="number"
                  className="w-fit"
                  name="submission_limit"
                  value={
                    settingsData?.submission_limit
                      ? settingsData?.submission_limit
                      : currentForm?.submission_limit
                  }
                  onChange={(e) => {
                    setSettingsData((prev: any) => ({
                      ...prev,
                      submission_limit: e?.target?.value,
                    }));
                  }}
                  content="flex-1"
                />
              </div>
            </div>
            <div className="w-full">
              {(!session?.data?.user?.pro ||
                session?.data?.user?.pro == "false") && (
                <NextLink href={"/settings/profile#pricing"}>
                  <p className="text-red-600 font-semibold text-xs">
                    *You must be an pro member to access this feature{" "}
                    <span className="text-black underline-offset-1 underline">
                      subscribe now -&gt;
                    </span>
                  </p>
                </NextLink>
              )}
              <div
                className={`flex flex-col md:flex-row items-start md:items-end border-b pb-2 justify-between gap-3 ${
                  !session?.data?.user?.pro ||
                  session?.data?.user?.pro == "false"
                    ? "pointer-events-none"
                    : ""
                } `}
              >
                <div>
                  <p className=" flex-1 font-semibold opacity-70">
                    Cache form fields
                  </p>
                  <p className="text-xs font-light">
                    Enable this option for caching unsubmitted form field values
                    for user.
                  </p>
                </div>
                <div className="font-light flex mr-auto md:mr-0 md:w-1/2  flex-row items-center justify-end gap-1">
                  Enable
                  <Switch
                    checked={
                      settingsData?.user_form_cache != null
                        ? settingsData?.user_form_cache
                        : currentForm?.user_form_cache
                    }
                    onCheckedChange={(e) => {
                      if (
                        !session?.data?.user?.pro ||
                        session?.data?.user?.pro == "false"
                      ) {
                        toast({
                          title: "Join pro membership",
                          description:
                            "You must be an pro member to access this feature",
                          variant: "destructive",
                        });
                      } else {
                        setSettingsData((prev: any) => ({
                          ...prev,
                          user_form_cache: e,
                        }));
                        setIsSettingChnaged(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center border-b pb-2 border-black/5 justify-between gap-3">
              <p className="flex-1 font-semibold opacity-70">API key</p>
              <div className="flex flex-row items-start gap-2 justify-between ">
                {currentForm?.api_enabled && (
                  <Link
                    className={`${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-500"
                    } border p-2 rounded-md h-10 w-10 cursor-pointer `}
                    onClick={() => {
                      if (isSettingChanged) {
                        toast({
                          title: "Save the changes",
                          description: "save the changes below",
                          variant: "destructive",
                          duration: 5000,
                        });
                      } else {
                        setCopied(true);
                        copyToClipBoard(`${currentForm?.api_key}`);
                      }
                    }}
                  />
                )}
                {currentForm?.api_enabled && (
                  <Button
                    onClick={() => {
                      changeAPIkey();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="animate-spin mr-2" />}{" "}
                    Regenerate
                  </Button>
                )}
              </div>
              <div className="font-light flex flex-row items-center justify-end gap-1 ">
                Enable
                <Switch
                  checked={
                    settingsData?.api_enabled != null
                      ? settingsData?.api_enabled
                      : currentForm?.api_enabled
                  }
                  onCheckedChange={(e) => {
                    setSettingsData((prev: any) => ({
                      ...prev,
                      api_enabled: e,
                    }));
                    setIsSettingChnaged(true);
                  }}
                />
              </div>
            </div>
            {!(
              currentForm?.closed == settingsData?.closed &&
              currentForm?.redirect == settingsData?.redirect &&
              currentForm?.user_form_cache == settingsData?.user_form_cache &&
              currentForm?.submission_limit == settingsData?.submission_limit &&
              currentForm?.redirect_url == settingsData?.redirect_url &&
              currentForm?.email_notify == settingsData?.email_notify &&
              currentForm?.api_enabled == settingsData?.api_enabled &&
              currentForm?.branding == settingsData?.branding &&
              currentForm?.api_key == settingsData?.api_key &&
              currentForm?.public == settingsData?.public
            ) && (
              <Button
                onClick={() => {
                  setSettingsData(currentForm);

                  setIsSettingChnaged(false);
                }}
                variant={"outline"}
                className="mr-2"
              >
                discard changes
              </Button>
            )}
            <Button
              disabled={
                (currentForm?.closed == settingsData?.closed &&
                  currentForm?.redirect == settingsData?.redirect &&
                  currentForm?.user_form_cache ==
                    settingsData?.user_form_cache &&
                  currentForm?.submission_limit ==
                    settingsData?.submission_limit &&
                  currentForm?.redirect_url == settingsData?.redirect_url &&
                  currentForm?.email_notify == settingsData?.email_notify &&
                  currentForm?.api_enabled == settingsData?.api_enabled &&
                  currentForm?.branding == settingsData?.branding &&
                  currentForm?.api_key == settingsData?.api_key &&
                  currentForm?.public == settingsData?.public) ||
                !currentForm
              }
              onClick={saveSettings}
            >
              Save changes
            </Button>
          </div>
        );
      case "share":
        return (
          <div className="w-full h-fit">
            <div className="m-0 mb-10 opacity-70">
              <p className="bg-[#f5f5f5] md:text-sm text-xs w-fit p-4 rounded-lg font-light">
                You can manage sharing and your form integrations here
              </p>
            </div>
            <div className="w-full h-fit ">
              <div className="h-full w-full pl-1 flex flex-col items-start justify-start gap-5">
                <div className="w-full h-full ">
                  <div className="w-full flex flex-col items-start gap-2 justify-between ">
                    <p className="font-semibold">Form link</p>
                    <div className="flex flex-row items-start gap-2 justify-between w-full md:w-1/2">
                      <Input
                        className="w-full bg-gray-50 border-gray-400 "
                        value={`https://form-x-eight.vercel.app/forms/${params?.id}`}
                        disabled
                      />
                      <Link
                        className={`${
                          copied
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-500"
                        } border p-2 rounded-md h-10 w-10 cursor-pointer `}
                        onClick={() => {
                          setCopied(true);
                          copyToClipBoard(
                            `https://form-x-eight.vercel.app/forms/${params?.id}`
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xl font-semibold opacity-70 mt-14">Embed</p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <NextLink href={`https://form-x-eight.vercel.app/form/${params.id}/embed`}>
                <div className="h-[20vh] rounded-lg border hover:shadow-2xl shadow-lg bg-white flex items-center justify-center cursor-pointer italic">
                  <p className="opacity-70 font-semibold font-dmsans ">
                    ⚡ Embed
                  </p>
                </div>
              </NextLink>
              <NextLink href={`https://form-x-eight.vercel.app/form/${params.id}/popup`}>
                <div className="h-[20vh] rounded-lg border hover:shadow-2xl shadow-lg bg-white flex items-center justify-center cursor-pointer italic">
                  <p className="opacity-70 font-semibold font-dmsans ">Popup</p>
                </div>
              </NextLink>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const fetchInitData = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `https://form-x-eight.vercel.app/api/form/${params?.id}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (
          session?.data?.user &&
          !data?.form?.workspaces?.collaborators?.find(
            (collabs: any) => collabs?.user_id == session?.data?.user?.user_id
          )
        ) {
          router.push("/dashboard");
        }
        setcurrentWorkspace(data?.form?.workspaces);
        console.log(data);
        setcurrentForm(data?.form);
        setSettingsData(data?.form);
        if (!data?.form?.published) {
          router.push(`https://form-x-eight.vercel.app/form/${params?.id}/edit`);
        }
        let cnt = 0;
        data?.form?.form_json?.forEach((page: any) => {
          cnt += page?.blocks?.length;
        });
        setcurFormFieldLen(cnt);
        setFetching(false);
        setTimeout(() => {}, 500);
      } else {
        setFetching(false);
      }
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveTab(localStorage?.getItem("formflowsettingstab") || "settings");
    }
    const handleStorageChange = (event: any) => {
      if (event.key == "formflowcurrenorganisation") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (
      !fetching &&
      session?.status == "authenticated" &&
      (!currentForm || !formResponses)
    ) {
      if (!fetching) {
        fetchInitData();
      }

      if (
        typeof window !== "undefined" &&
        localStorage?.getItem("formflowsettingstab") == "response"
      ) {
        fetchData();
      }
    }
  }, [session, session?.status]);

  return (
    <div className="w-full h-full  flex flex-col items-start justify-start pt-5 md:py-10 py-5 px-5 md:p-10 md:pt-7">
      <Breadcrumb className="pb-10 text-gray-400">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="cursor-pointer font-semibold text-gray-600 ">
              {currentForm ? (
                <NextLink
                  href={`https://form-x-eight.vercel.app/workspaces/${currentForm?.workspaces?.workspace_id}`}
                >
                  {currentForm?.workspaces?.name}
                </NextLink>
              ) : (
                <Skeleton className="w-20 h-7" />
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-600">
              {currentForm ? (
                <span> {currentForm?.title}</span>
              ) : (
                <Skeleton className="w-20 h-6" />
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full pb-5 flex md:flex-row flex-col md:items-center mb-5 gap-2 md:gap-0 justify-between">
        {currentForm ? (
          <p className="font-semibold text-left text-xl text-[#0f0f0f]">
            {currentForm?.title}
            <span className="block text-sm opacity-60 font-light">
              {currentForm?.description}
            </span>
          </p>
        ) : (
          <div>
            <Skeleton className="font-semibold mb-2 text-left text-xl text-transparent">
              Workspace name is long
            </Skeleton>
            <Skeleton className="block w-fit text-sm text-transparent font-normal">
              Workspace description
            </Skeleton>
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row items-center justify-start gap-4 md:gap-7">
          <div className="relative bg-white overflow-hidden border-b box-content p-0 border-black50 grid grid-cols-5 gap-2">
            <div
              className="absolute bg-white border-b border-black h-full bottom-0 transition-all ease-in-out duration-500"
              style={slideStyle}
            ></div>
            <Button
              ref={(el: any) => (tabRefs.current["response"] = el)}
              className={`relative hover:bg-transparent bg-transparent z-10 text-[10px] md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
                activeTab === "response" ? "text-[#09090B]" : "text-[#b3b3b7]"
              }`}
              onClick={() => {
                fetchData();
                if (typeof window !== "undefined") {
                  localStorage?.setItem("formflowsettingstab", "response");
                }
                setActiveTab("response");
              }}
            >
              Responses
            </Button>
            <Button
              ref={(el: any) => (tabRefs.current["analytics"] = el)}
              className={`relative hover:bg-transparent bg-transparent z-10 text-[10px] md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
                activeTab === "analytics" ? "text-[#09090B]" : "text-[#b3b3b7]"
              }`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage?.setItem("formflowsettingstab", "analytics");
                }
                setActiveTab("analytics");
              }}
            >
              Analytics
            </Button>
            <Button
              ref={(el: any) => (tabRefs.current["integrations"] = el)}
              className={`relative hover:bg-transparent bg-transparent z-10 text-[10px] md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
                activeTab === "integrations"
                  ? "text-[#09090B]"
                  : "text-[#b3b3b7]"
              }`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage?.setItem("formflowsettingstab", "integrations");
                }
                setActiveTab("integrations");
              }}
            >
              Integrations
            </Button>
            <Button
              ref={(el: any) => (tabRefs.current["settings"] = el)}
              className={`relative hover:bg-transparent bg-transparent z-10 text-[10px] md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
                activeTab === "settings" ? "text-[#09090B]" : "text-[#b3b3b7]"
              }`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage?.setItem("formflowsettingstab", "settings");
                }
                setActiveTab("settings");
              }}
            >
              Settings
            </Button>
            <Button
              ref={(el: any) => (tabRefs.current["share"] = el)}
              className={`relative hover:bg-transparent bg-transparent z-10 text-[10px] md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
                activeTab === "share" ? "text-[#09090B]" : "text-[#b3b3b7]"
              }`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage?.setItem("formflowsettingstab", "share");
                }
                setActiveTab("share");
              }}
            >
              Share
            </Button>
          </div>
          <div className="flex flex-row items-center justify-start gap-2 ml-auto md:ml-0">
            <Link
              className={`${
                copied ? "bg-green-600 text-white" : "bg-white text-gray-500"
              } border p-2 rounded-md h-10 w-10 cursor-pointer `}
              onClick={() => {
                setCopied(true);
                copyToClipBoard(`https://form-x-eight.vercel.app/forms/${params?.id}`);
              }}
            />
            <button
              onClick={() => {
                router.replace(`https://form-x-eight.vercel.app/form/${params?.id}/edit`);
              }}
              className="bg-black/5 text-black px-4 py-2 rounded-md hover:bg-black/10"
            >
              <Pencil size={15} className="inline mr-1" />
              Edit
            </button>
          </div>
        </div>
      </div>
      {currentWorkspace &&
        !currentWorkspace?.collaborators?.find(
          (collab: any) =>
            collab.role == "admin" &&
            collab?.users?.collaborator_id == session?.data?.user?.id
        ) && (
          <div className="flex flex-row mb-2 items-center justify-start gap-3 w-fit ">
            <span className="w-6 h-6 p-1 rounded-full font-bold flex items-center justify-center text-white bg-orange-600">
              i
            </span>
            <p className="text-orange-500 font-semibold text-sm">
              {" "}
              You must be an admin to edit this form.
            </p>
          </div>
        )}

      <div className="w-full pb-28">
        {renderContent(currentForm?.form_json)}
      </div>
    </div>
  );
};

export default Page;
