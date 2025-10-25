"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { DataTable } from "./ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "./ui/use-toast";
import forms from "@/app/services/forms";
import { Link, Loader2, Loader2Icon, RefreshCcw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import FormRenderer from "./FormRender";
const Editor = dynamic(() => import("@/components/Editorjs/Editor"), {
  ssr: false,
});
// Define a type for your form response data
export type FormResponse = {
  id: string;
  // Add properties for each field in your form response
  // For example:
  name: string;
  email: string;
  message: string;
  // Add more properties as needed
};

// Define columns for displaying form responses
export const formResponseColumns: ColumnDef<FormResponse>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  // Add more columns as needed for other form fields
];
const generateFormResponseColumns = (
  formResponses: FormResponse[]
): ColumnDef<FormResponse>[] => {
  console.log(formResponses);
  // Initialize an empty array to store unique field names
  const uniqueFields: string[] = [];

  // Iterate through form responses to extract unique field names
  formResponses?.forEach((response: any) => {
    Object.keys(response.responses).forEach((field) => {
      // Check if the field is not already in the uniqueFields array
      if (!uniqueFields.includes(field)) {
        uniqueFields.push(field);
      }
    });
  });

  // Generate columns based on unique field names
  const columns: ColumnDef<FormResponse>[] = uniqueFields.map((field) => ({
    accessorKey: `responses.${field}`,
    header: field.charAt(0).toUpperCase() + field.slice(1), // Capitalize the field name
  }));

  return columns;
};

const FormDetails = ({
  close,
  form,
  api_status,
  session,
  currentWorkspace,
}: {
  close: () => void;
  form: any;
  api_status: boolean;
  session: any;
  currentWorkspace: any;
}) => {
  // State for storing form response data
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [isFetching, setisFetching] = useState(false);
  const [isIntegrating, setisIntegrating] = useState(false);
  const [isPreviewing, setisPreviewing] = useState(false);
  const router = useRouter();
  // Fetch actual form response data from your backend or wherever it's stored
  const fetchFormResponses = async () => {
    setisFetching(true);
    // Example: Fetch form responses from an API endpoint
    const response = await fetch(
      `/api/form_responses?form_id=${form?.form_id}`
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
    // Fetch form responses when the component mounts
    // fetchData();
    setcurrentForm(form);
  }, [form]);
  useEffect(() => {
    if (formResponses) {
      const formResponseColumns = generateFormResponseColumns(formResponses);
      setColumns(formResponseColumns);
    }
  }, [formResponses]);

  const [activeTab, setActiveTab] = useState("form");
  const [slideStyle, setSlideStyle] = useState({});
  const [isPublishing, setisPublishing] = useState(false);
  const [currentForm, setcurrentForm]: any = useState(form);
  const [columns, setColumns]: any = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAPIcopied, setisAPIcopied] = useState(false);

  const formServive = new forms();
  const { toast } = useToast();
  const tabRefs = useRef<any>([]);

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
  // const connectToGoogleSheets = async () => {
  //   try {
  //     const response = await fetch("/api/google-sheets/connect");
  //     // window.location.href = response;
  //   } catch (error) {
  //     console.error("Error initiating Google Sheets connection:", error);
  //     toast({
  //       title: "Error",
  //       description: "Could not initiate Google Sheets connection.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setisIntegrating(true);
      const respinse = await fetch("https://form-x-eight.vercel.app/api/get-auth-url", {
        method: "POST",
        body: JSON.stringify({ form_id: form.form_id }),
      });
      const data = await respinse.json();
      console.log(data);
      if (window && data?.url) {
        // Open the URL in a popup window with specific dimensions
        // window.open(
        //   data.url,
        //   "AuthPopup",
        //   "width=600,height=600,scrollbars=yes,resizable=yes"
        // );

        router.push(data.url);
      }

      // const result = await signInWithPopup(auth, provider);
      // const user = result.user;
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      // const refreshToken = user.refreshToken; // Obtain the refresh token

      // const response = await fetch("/api/create-sheet", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ token, refreshToken, form_id: form?.form_id }),
      // });

      // const data = await response.json();
      // console.log("API Response:", data);
      // setisIntegrating(false);
      // toast({
      //   title: "Google sheet Integrated successfully",
      //   duration: 2000,
      // });
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

  // https://docs.google.com/spreadsheets/d/1_lNnuy4BuJ83ykpzcDunLj-ahDHpbm80EguY2lfCyoo/edit?gid=0#gid=0
  const saveForm = async () => {};
  const renderContent = (json: any) => {
    switch (activeTab) {
      case "form":
        return (
          <div className="w-full relative flex-1 flex bg-[#f4f4f5] h-full overflow-y-scroll  pt-20 border rounded-lg shadow-sm items-start justify-center gap-5">
            <div className="flex  absolute top-5 left-5 items-center justify-between gap-2">
              <Button
                className={`${
                  isAPIcopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-gray-500 hover:bg-slate-100"
                } border p-2 rounded-md cursor-pointer  `}
                disabled={
                  !api_status ||
                  !currentWorkspace?.collaborators?.find(
                    (collab: any) =>
                      collab.role == "admin" &&
                      collab?.users?.email == session?.data?.user?.email
                  )
                }
                onClick={() => {
                  setisAPIcopied(true);
                  copyToClipBoard(
                    `https://form-x-eight.vercel.app/api/addformresponse/${currentForm?.form_id}?api_key=${currentForm?.form_api_key}`
                  );
                }}
              >
                API-endpoint
                <Link className="inline ml-2" />
              </Button>
            </div>
            <div className="flex  absolute top-5 right-5 items-center justify-between gap-2">
              <Link
                className={`${
                  copied ? "bg-green-600 text-white" : "bg-white text-gray-500"
                } border p-2 rounded-md h-10 w-10 cursor-pointer `}
                onClick={() => {
                  setCopied(true);
                  copyToClipBoard(
                    `https://form-x-eight.vercel.app/forms/${currentForm?.form_id}`
                  );
                }}
              />
              <Button
                disabled={
                  !currentWorkspace?.collaborators?.find(
                    (collab: any) =>
                      collab.role == "admin" &&
                      collab?.users?.email == session?.data?.user?.email
                  )
                }
                onClick={publishForm}
                className="flex-1 bg-blue-500 hover:bg-blue-600 font-semibold"
              >
                {currentForm?.published ? "Unpublish" : "Publish"}
              </Button>
              {!isPreviewing && (
                <Button
                  onClick={() => setisPreviewing((prev) => !prev)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 font-semibold"
                >
                  {"Edit"}
                </Button>
              )}
            </div>
            {!isPreviewing && currentForm?.published ? (
              <FormRenderer
                preview={true}
                formId={currentForm?.form_id}
                form={currentForm}
                cancelPreview={() => setisPreviewing((prev) => !prev)}
                fullWidth={false}
              />
            ) : (
              <></>
              // <Editor
              //   form={currentForm}
              //   json={json}
              //   cancelPreview={() => setisPreviewing((prev) => !prev)}
              // />
            )}
            {/* <FormRenderer
              preview={true}
              formId={currentForm?.form_id}
              json={json}
            /> */}
          </div>
        );
      case "response":
        return (
          <div className="px-2 w-full md:px-10 mx-auto relative  py-10">
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
              <DataTable columns={columns} data={formResponses} />
            )}
          </div>
        );
      case "analytics":
        return (
          <div className="grid gap-4 w-full md:grid-cols-2 lg:grid-cols-4 pb-10">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                <div className="text-2xl font-bold">
                  {form?.opened_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">live analytics</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                <div className="text-2xl font-bold">
                  {form?.submitted_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">live analytics</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                <div className="text-2xl font-bold">
                  {form?.api_submitted_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">live analytics</p>
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
                  <div className="w-full flex bg-white border rounded-md p-5 flex-row items-center justify-between gap-5">
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
                  </div>
                ))}
            </div>
            <div className="grid gap-4 w-full md:grid-cols-2 lg:grid-cols-4 pb-10">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
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
                    disabled={isIntegrating}
                  >
                    {isIntegrating && (
                      <Loader2Icon className="animate-spin mr-2" size={16} />
                    )}{" "}
                    Connect to Google Sheets
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Notion</CardTitle>
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
                    onClick={() => {
                      router.push(
                        `https://api.notion.com/v1/oauth/authorize?client_id=1fb8f6c9-5e73-4c85-9351-5464b2ed2983&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fform-x-eight.vercel.app%2Fnotion&state=${form?.form_id}`
                      );
                    }}
                    className="shadow-custom bg-white hover:bg-orange-50 text-black border border-black"
                  >
                    Connect to notion
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    Air Table
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
                  <Button className="bg-[#26b5f8] text-white">
                    Connect to Airtable
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start pt-5 md:py-10 py-5 px-2 md:p-10">
      <Breadcrumb className="pb-10 text-gray-400">
        <BreadcrumbList>
          <BreadcrumbItem onClick={close}>
            <BreadcrumbPage className="cursor-pointer text-gray-600 font-semibold ">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-gray-400">
              Form
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full pb-5 border-b flex md:flex-row flex-col md:items-center mb-5 gap-2 md:gap-0 justify-between">
        {form ? (
          <p className="font-semibold text-left text-xl text-gray-500">
            {currentForm?.title}
            <span className="block text-sm opacity-60 font-normal">
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
        <div className="relative bg-[#f4f4f5] overflow-hidden rounded-lg p-1 grid grid-cols-4 gap-2">
          <div
            className="absolute bg-white shadow-md h-[85%] top-1/2 -translate-y-1/2 my-auto transition-all ease-in-out duration-500 rounded-lg"
            style={slideStyle}
          ></div>
          <Button
            ref={(el: any) => (tabRefs.current["form"] = el)}
            className={`relative hover:bg-transparent bg-transparent z-10 text-xs md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
              activeTab === "form" ? "text-[#09090B]" : "text-[#b3b3b7]"
            }`}
            onClick={() => setActiveTab("form")}
          >
            Form
          </Button>
          <Button
            ref={(el: any) => (tabRefs.current["response"] = el)}
            className={`relative hover:bg-transparent bg-transparent z-10 text-xs md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
              activeTab === "response" ? "text-[#09090B]" : "text-[#b3b3b7]"
            }`}
            onClick={() => {
              fetchData();
              setActiveTab("response");
            }}
          >
            Responses
          </Button>
          <Button
            ref={(el: any) => (tabRefs.current["analytics"] = el)}
            className={`relative hover:bg-transparent bg-transparent z-10 text-xs md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
              activeTab === "analytics" ? "text-[#09090B]" : "text-[#b3b3b7]"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </Button>
          <Button
            ref={(el: any) => (tabRefs.current["integrations"] = el)}
            className={`relative hover:bg-transparent bg-transparent z-10 text-xs md:text-sm hover:scale-95 transition-transform ease-out duration-200 ${
              activeTab === "integrations" ? "text-[#09090B]" : "text-[#b3b3b7]"
            }`}
            onClick={() => setActiveTab("integrations")}
          >
            Integrations
          </Button>
        </div>
      </div>
      {!currentWorkspace?.collaborators?.find(
        (collab: any) =>
          collab.role == "admin" &&
          collab?.users?.email == session?.data?.user?.email
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

      {renderContent(currentForm?.form_json)}
    </div>
  );
};

export default FormDetails;
