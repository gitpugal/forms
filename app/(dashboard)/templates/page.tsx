"use client";

import React, { useState, useEffect } from "react";
import { EyeIcon, Loader2Icon, TimerIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FormRenderer from "@/components/FormRender";
import { useRouter } from "next/navigation";

const page = () => {
  const [forms, setForms]: any = useState(null);
  const { toast } = useToast();
  const router = useRouter();
  const [templeForm, setTempleForm]: any = useState({
    curForm: null,
    open: false,
  });
  const [isWorkspaceDialogOpen, setisWorkspaceDialogOpen] = useState(false);
  const [selectedWorspace, setselectedWorspace] = useState(null);
  const [isFetchingInvitations, setisFetchingInvitations] = useState(false);
  const [isFetchingWorkspaces, setisFetchingWorkspaces] = useState(false);

  const [workspaces, setworkspaces]: any = useState([]);
  const session: any = useSession();
  const [isCopyingToWorkspace, setisCopyingToWorkspace] = useState(false);

  useEffect(() => {
    // Fetch invitations received for the current user
    const fetchInvitations = async (changeForm: boolean) => {
      if (changeForm) {
        setisFetchingInvitations(true);
      } else {
        setisFetchingWorkspaces(true);
      }
      try {
        let currentOrganizationId = localStorage?.getItem(
          "formflowcurrenorganisation"
        );
        const response = await fetch(
          `/api/templates?user_id=${session.data?.user?.user_id}&org_id=${currentOrganizationId}`
        );
        const data = await response.json();
        if (changeForm) {
          setForms(data?.templates);
        }
        setworkspaces(data?.workspaces);
        console.log(data);
      } catch (error) {
        setisFetchingInvitations(false);
        setisFetchingWorkspaces(false);
        console.error("Error fetching invitations:", error);
      }
      setisFetchingInvitations(false);
      setisFetchingWorkspaces(false);
    };
    if (session?.data) {
      if (!isFetchingInvitations && !forms) {
        fetchInvitations(true);
      }
    }

    const handleStorageChange = (event: any) => {
      if (event.key === "formflowcurrenorganisation") {
        if (
          session?.status === "authenticated" &&
          session?.data?.user?.user_id &&
          !isFetchingInvitations
        ) {
          fetchInvitations(false);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [session]);

  const useTemplate = async () => {
    try {
      setisCopyingToWorkspace(true);
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/copy-template-to-workspace",
        {
          method: "POST",
          body: JSON.stringify({
            form_id: templeForm?.curForm?.form_id,
            workspace_id: selectedWorspace,
          }),
        }
      );

      if (response.ok) {
        setisCopyingToWorkspace(false);
        const { form } = await response.json();
        toast({
          title: "Template copied to your workspace",
          description: "Template copied to workspace sucessfully !",
          duration: 2000,
        });
        // setForms((prev: any) =>
        //   prev?.filter((form: any) => form?.form_id != formToDuplicate)
        // );
        setTempleForm({
          curForm: null,
          open: false,
        });
        setisCopyingToWorkspace(false);
        setselectedWorspace(null);
        const event: any = new Event("storage");
        event.key = "formflowcurrenorganisation";
        event.newValue = workspaces?.find(
          (workspace: any) => workspace?.workspace_id == selectedWorspace
        )?.organizations?.organization_id;
        window.dispatchEvent(event);
        localStorage?.setItem(
          "formflowcurrenorganisation",
          workspaces?.find(
            (workspace: any) => workspace?.workspace_id == selectedWorspace
          )?.organizations?.organization_id
        );
        router.push(
          `https://form-x-eight.vercel.app/form/${form?.form_id}/edit`
        );
      } else {
        toast({
          title: "An error occured",
          variant: "destructive",
          description: "Cannot delete this form try again!",
          duration: 2000,
        });
      }
    } catch (error) {
      setisCopyingToWorkspace(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot delete this form try again!",
        duration: 2000,
      });
    }
    setisCopyingToWorkspace(false);
  };

  const formatTimeAgo = (updated_at: string) => {
    const now: any = new Date();
    const updatedDate: any = new Date(updated_at);
    const diffMs = now - updatedDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return updatedDate.toLocaleDateString();
    }
  };
  return (
    <div className="h-full w-full font-inter  p-5 md:p-10 md:pt-7">
      <p className="text-left text-xl text-[#0f0f0f]">
        Templates
        <span className="block text-sm font-light text-[#636363]">
          Find a template from the global template list.
        </span>
      </p>
      <div className="w-full min-h-full max-h-fit pb-20 mt-10  mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {isFetchingInvitations ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="p-8 rounded-2xl w-full shadow-md cursor-pointer bg-[#f5f5f5] flex flex-row gap-5 items-start justify-between"
            >
              <div className="w-1/2">
                <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                  Form name
                </Skeleton>
                <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                  Form description
                </Skeleton>
              </div>
              <div className="text-gray-500 flex flex-col items-end justify-between w-1/2 h-full">
                <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                  Form name
                </Skeleton>
                <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                  Form description
                </Skeleton>
              </div>
            </Skeleton>
          ))
        ) : (
          <>
            {" "}
            {forms && forms.length == 0 ? (
              <p className="font-light w-full text-center my-auto">
                No templates available now!
              </p>
            ) : (
              forms?.map((workspace: any) => (
                <div
                  className="border w-full h-fit rounded-xl overflow-hidden relative md:rounded-2xl  bg-[#f5f5f5]  flex flex-col gap-5 items-start justify-between"
                  key={workspace.form_id}
                  onClick={(e: any) => {}}
                >
                  <div
                    onClick={() => {
                      setTempleForm({
                        open: true,
                        curForm: workspace,
                      });
                      console.log(workspace);
                    }}
                    className="w-full relative cursor-pointer h-[40vh] md:h-[50vh] md:rounded-none rounded-md overflow-hidden p-1 md:p-5"
                  >
                    <FormRenderer
                      preview={true}
                      formId={workspace?.form_id}
                      form={workspace}
                      cancelPreview={() => {}}
                      fullWidth={true}
                    />
                  </div>
                  <div className="w-full bg-[#f5f5f5]  h-[30%] z-50 p-2 md:p-5">
                    <div className="w-full h-fit xl relative cursor-pointer bg-[#f5f5f5]  flex flex-row gap-5 md:gap-2 items-start justify-between">
                      <div>
                        <p className="md:text-xl font-[500] text-[#0f0f0f]">
                          {workspace?.title}
                        </p>
                        <p className="text-xs md:text-sm  font-light text-[#636363]">
                          {workspace?.description}
                        </p>
                      </div>
                      <div
                        id="form-controls"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 flex flex-col items-end justify-between w-fit gap-4 ml-auto md:ml-0"
                      >
                        <div className="flex flex-row items-center justify-end gap-2">
                          <p className="text-xs font-light text-gray-400 text-right">
                            <TimerIcon className="inline ml-2 mb-1" size={15} />{" "}
                            last updated{" "}
                            {workspace?.updated_at &&
                              formatTimeAgo(workspace?.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTempleForm({
                          open: true,
                          curForm: workspace,
                        });
                        console.log(workspace);
                      }}
                      className="w-full  p-2 py-4  text-xs mt-3  md:text-sm  rounded-lg cursor-pointer h-auto text-center hover:bg-slate-50 bg-white"
                    >
                      <EyeIcon className="inline" size={13} /> view template
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      <Dialog
        open={templeForm?.open}
        onOpenChange={(state: boolean) => {
          if (!state) {
            setTempleForm({
              curForm: null,
              open: false,
            });
          } else {
            setTempleForm((prev: any) => ({
              ...prev,
              open: prev,
            }));
          }
        }}
      >
        <DialogContent className="w-auto md:min-w-[95vw] h-[95vh] overflow-y-auto custom-scrollbar md:p-5 p-3">
          <DialogHeader>
            <div className="flex flex-col md:w-[70%] mx-auto md:flex-row py-5 items-start justify-between gap-5">
              <div className="flex flex-col   items-start justify-start ">
                <p className="font-semibold">Preview template</p>
                <p className="text-xs">Use this template in your workpspace.</p>
              </div>
              <div className="flex flex-row items-center justify-between gap-3">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setTempleForm({
                      curForm: null,
                      open: false,
                    });
                  }}
                  className=""
                >
                  close preview
                </Button>
                <Button
                  onClick={() => {
                    setisWorkspaceDialogOpen(true);
                  }}
                >
                  Use template
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="w-full h-fit ">
            {/* {te && previewForm && ( */}
            <FormRenderer
              preview={true}
              formId={templeForm?.curForm?.form_id}
              form={templeForm?.curForm}
              cancelPreview={() => {}}
              fullWidth={false}
            />
            {/* )} */}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isWorkspaceDialogOpen}
        onOpenChange={(state: boolean) => {
          setisWorkspaceDialogOpen(state);
        }}
      >
        <DialogContent className="min-w-[50vw] h-[80vh] custom-scrollbar overflow-y-auto md:p-5 p-3">
          <DialogHeader>
            <div className="flex flex-col w-full mx-auto  py-5 items-start justify-between gap-5">
              <div className="flex flex-col   items-start justify-start ">
                <p className="font-semibold">Use Template</p>
                <p className="text-xs">
                  Use this template in any of your workpspace.
                </p>
              </div>
              <div className="flex flex-row items-center justify-between gap-3">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setisWorkspaceDialogOpen(false);
                    setselectedWorspace(null);
                  }}
                  className=""
                >
                  close
                </Button>
                <Button
                  disabled={!selectedWorspace || isCopyingToWorkspace}
                  onClick={() => {
                    useTemplate();
                  }}
                >
                  {isCopyingToWorkspace && (
                    <Loader2Icon className="inline mr-2 animate-spin" />
                  )}
                  Copy to selected workpspace
                </Button>
              </div>
            </div>
            <div className="w-full h-fit grid grid-cols-1 items-start justify-start gap-3">
              {/* <div
              className={`px-3 cursor-pointer font-semibold bg-gray-100 py-2 rounded-lg flex flex-row justify-between items-center gap-3 border`}
            >
              <p>Workspace name</p>
              <span className="inline text-sm font-light">
                Workspace organization
              </span>
            </div> */}
              {!isFetchingWorkspaces ? (
                workspaces?.map((workspace: any) => (
                  <div
                    onClick={() => {
                      setselectedWorspace((prev) =>
                        prev == workspace?.workspace_id
                          ? null
                          : workspace?.workspace_id
                      );
                    }}
                    className={`px-3 cursor-pointer py-2 rounded-lg flex flex-row justify-between items-center gap-3 border ${
                      selectedWorspace == workspace?.workspace_id &&
                      "border-green-500 text-green-500"
                    }`}
                  >
                    <p>{workspace.name}</p>
                    <span className="inline text-sm font-light">
                      {workspace?.organizations?.admin?.first_name}
                    </span>
                  </div>
                ))
              ) : (
                <Loader2Icon className="animate-spin  mx-auto my-auto mt-20" />
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default page;
