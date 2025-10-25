"use client";
import { Link, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

const page = ({ params }: { params: { id: string } }) => {
  const [copied, setCopied] = useState(false);
  const { data: session, status }: any = useSession();
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [currentWorkspace, setcurrentWorkspace]: any = useState(null);
  const [isAPIEnabled, setisAPIEnabled] = useState(
    currentWorkspace?.api_enabled
  );
  const router = useRouter();
  const [fetching, setFetching] = useState(false);
  const [api_key, setApiKey] = useState(currentWorkspace?.api_key);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const changeAPIstatus = async (e: boolean) => {
    setisAPIEnabled((prev: boolean) => !prev);
    try {
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/changeworspaceapistatus",
        {
          method: "POST",
          body: JSON.stringify({
            status: e,
            workspace_id: currentWorkspace?.workspace_id,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "API status changed successfully!",
          duration: 5000,
        });
        // fetchDataWithoutStateChange();
      } else {
        setisAPIEnabled((prev: boolean) => !prev);
      }
    } catch (error) {
      setisAPIEnabled((prev: boolean) => !prev);
      toast({
        title: "API status cannot be changed",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const changeAPIkey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://form-x-eight.vercel.app/api/changeapikey", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: currentWorkspace?.workspace_id,
        }),
      });

      if (response.ok) {
        toast({
          title: "API regenerated successfully!",
          duration: 5000,
        });
        // fetchDataWithoutStateChange();

        const { form } = await response.json();
        setApiKey(form?.api_key);
      } else {
        setisAPIEnabled((prev: boolean) => !prev);
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Cannot regenerate API key, Try again.",
        duration: 5000,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const fetchData = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `https://form-x-eight.vercel.app/api/workspace/${params?.id}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (
          !data?.collaborators?.find(
            (collabs: any) => collabs?.user_id == session?.user?.user_id
          )
        ) {
          router.push("/dashboard");
        }
        setcurrentWorkspace(data?.workspace);
        setisAPIEnabled(data?.workspace?.api_enabled);
        setApiKey(data?.workspace?.api_key);
        setFetching(false);
      } else {
        setFetching(false);
      }
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!fetching) {
      fetchData();
    }

    const handleStorageChange = (event: any) => {
      if (event.key == "formflowcurrenorganisation") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }, []);
  return (
    <div className="w-full h-full px-10 mt-5">
      <Breadcrumb className="pb-10 text-gray-400">
        <BreadcrumbList>
          <BreadcrumbItem
            onClick={() => {
              router.push(`/workspaces/${params.id}`);
            }}
          >
            <BreadcrumbPage className="cursor-pointer text-gray-600 font-semibold ">
              {currentWorkspace ? (
                <span>{currentWorkspace?.name}</span>
              ) : (
                <Skeleton className="w-20 h-7" />
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-gray-400">
              Settings
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="m-0">
        <p className="font-semibold">Settings</p>
        <p>You can manage organization and workspace configuration here.</p>
      </div>
      <div className="w-full h-full ">
        <div className="h-full w-full py-10 pl-1 flex flex-col items-start justify-start gap-5">
          <div className="w-full h-full pt-10">
            <div className="w-full flex items-stretch justify-between ">
              <p className="font-semibold">API key</p>
              <div className="flex flex-row items-start gap-2 justify-between w-1/2">
                <Input
                  className="w-full bg-gray-50 border-gray-400 "
                  value={api_key}
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
                    copyToClipBoard(`${currentWorkspace?.api_key}`);
                  }}
                />
                <Button
                  onClick={() => {
                    changeAPIkey();
                  }}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="animate-spin mr-2" />}{" "}
                  Regenerate
                </Button>
              </div>
              <div className="flex flex-col  items-stretch justify-between ">
                <p>Enable {isAPIEnabled}</p>
                <Switch
                  checked={isAPIEnabled}
                  onCheckedChange={(e) => {
                    changeAPIstatus(e);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
