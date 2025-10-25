"use client";
import organizationService from "@/app/services/organization";
import OnboardToast from "@/components/OnboardToast";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Ellipsis,
  Link2Icon,
  Loader,
  Loader2Icon,
  PencilIcon,
  TimerIcon,
  TrashIcon,
} from "lucide-react";

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { FormCreatModal } from "@/components/modals/FormCreateModal";
import MemberInviteModal from "@/components/modals/MemberInviteModal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Page = () => {
  const session: any = useSession();
  const router = useRouter();
  const organizationservice: any = new organizationService();
  const [workspaces, setWorkSpaces]: any = useState(null);
  const [currentWorkspace, setCurrentWorkspace]: any = useState(null);
  const [fetching, setFetching] = useState(false);
  const [onboardExpand, setonboardExpand] = useState(false);
  const [organization, setorganization]: any = useState(null);
  const [currentOrganization, setcurrentOrganization]: any = useState(null);
  const [fetchedData, setFetchedData] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isFetchingInvitations, setisFetchingInvitations] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalIsOpen] = useState(false);
  const [recentForms, setRecentForms]: any = useState(null);
  const { toast } = useToast();
  const [sessionReady, setSessionReady] = useState(false);

  const [formRenameDialogOpen, setFormRenameDialogOpen] = useState({
    open: false,
    form_id: null,
    name: "",
  });

  const [formDeleteDialogOpen, setFormDeleteDialogOpen] = useState({
    open: false,
    form_id: null,
  });
  const [isRenamingForm, setRenamingForm] = useState(false);
  useEffect(() => {
    if (session && session.data) {
      setSessionReady(true);
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const curorgid = localStorage?.getItem("formflowcurrenorganisation");
      console.log("curorgid: ", curorgid);
      const data: any = await organizationservice.getUserOrganizations(
        session?.data?.user?.user_id,
        curorgid
      );
      if (data?.message == "User not present") {
        signOut();
        router.replace("https://form-x-eight.vercel.app/");
        localStorage?.clear();
      }
      setFetching(false);
      console.log(data);

      if (data?.organizations && data.organizations.length > 0) {
        let curorg;
        if (curorgid) {
          curorg = data?.organizations?.find(
            (org: any) => org?.organization_id == curorgid
          );
        }

        if (!curorg) {
          curorg = data?.organizations[0];
          localStorage?.setItem(
            "formflowcurrenorganisation",
            curorg?.organization_id
          );
        }

        setcurrentOrganization(curorg);
        setWorkSpaces(curorg?.workspaces);
      }

      setorganization(data?.organizations);
      setRecentForms(data?.forms);
      setisFetchingInvitations(true);
      try {
        const response = await fetch(
          `/api/received-invitations?email=${session?.data?.user?.email}`
        );
        const data = await response.json();
        console.log(data);
        setInvitations(data.invitations);
      } catch (error) {
        setisFetchingInvitations(false);
        console.error("Error fetching invitations:", error);
      }
      setisFetchingInvitations(false);
      setFetchedData(true);
    } catch (error) {
      console.log(error);
      setWorkSpaces(null);
      setFetching(false);
      setFetchedData(true);
      setisFetchingInvitations(false);
    }
  };

  useEffect(() => {
    if (
      !fetchedData &&
      sessionReady &&
      session &&
      session.data &&
      !fetching &&
      !organization
    ) {
      fetchData();
    }
  }, [session, sessionReady, fetchedData]);

  useEffect(() => {
    const handleStorageChange = (event: any) => {
      if (event.key === "formflowcurrenorganisation") {
        const checkSessionAndFetch = async () => {
          while (!sessionReady) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          fetchData();
        };
        checkSessionAndFetch();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [sessionReady, session]);

  const [copied, setCopied] = useState(false);
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [isDuplicating, setisDuplicating] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);
  const [deleteDialogopen, setdeleteDialogopen] = useState(false);
  const [duplicateDialogopen, setduplicateDialogopen] = useState(false);
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

  const duplicateForm = async (formToDuplicate: string) => {
    try {
      setisDuplicating(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/duplicateForm", {
        method: "POST",
        body: JSON.stringify({ form_id: formToDuplicate }),
      });

      if (response.ok) {
        setisDuplicating(false);
        const { form } = await response.json();
        toast({
          title: "Form duplicated",
          description: "Form duplicated sucessfully !",
          duration: 2000,
        });
        setduplicateDialogopen(false);
      } else {
        toast({
          title: "An error occured",
          variant: "destructive",
          description: "Cannot duplicate this form try again!",
          duration: 2000,
        });
      }
    } catch (error) {
      setisDuplicating(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot duplicate this form try again!",
        duration: 2000,
      });
    }
    setisDuplicating(false);
  };

  const deleteForm = async () => {
    try {
      setisDeleting(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/form", {
        method: "DELETE",
        body: JSON.stringify({
          form_id: formDeleteDialogOpen?.form_id,
          move_to_trash: true,
        }),
      });

      if (response.ok) {
        setisDeleting(false);
        const { form } = await response.json();
        setRecentForms((prev: any) =>
          prev?.filter(
            (form: any) => form?.form_id != formDeleteDialogOpen?.form_id
          )
        );
        toast({
          title: "Form deleted",
          description: "Form deleted sucessfully !",
          duration: 2000,
        });
        setdeleteDialogopen(false);
        setFormDeleteDialogOpen({
          open: false,
          form_id: null,
        });
      } else {
        toast({
          title: "An error occured",
          variant: "destructive",
          description: "Cannot delete this form try again!",
          duration: 2000,
        });
      }
    } catch (error) {
      setisDeleting(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot delete this form try again!",
        duration: 2000,
      });
    }
    setisDeleting(false);
  };

  const renameForm = async () => {
    try {
      setRenamingForm(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/renameForm", {
        method: "PUT",
        body: JSON.stringify({
          form_id: formRenameDialogOpen?.form_id,
          title: formRenameDialogOpen?.name,
        }),
      });

      if (response.ok) {
        setRenamingForm(false);
        const data = await response.json();
        toast({
          title: "Workpspace renamed",
          description: "Workpspace renamed sucessfully !",
          duration: 2000,
        });
        setRecentForms((prev: any) =>
          prev?.map((form: any) => {
            if (form?.form_id == formRenameDialogOpen?.form_id) {
              return { ...form, title: formRenameDialogOpen?.name };
            }
            return form;
          })
        );
        setFormRenameDialogOpen({
          open: false,
          name: "",
          form_id: null,
        });
      } else {
        const { message } = await response.json();

        toast({
          title: message || "Cannot rename try again",
          variant: "destructive",
          description: "Cannot rename this woekspace try again!",
          duration: 2000,
        });
      }
    } catch (error) {
      setRenamingForm(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot delete this form try again!",
        duration: 2000,
      });
    }
    setRenamingForm(false);
  };
  return (
    <div className="flex relative font-inter flex-col items-center justify-start w-full min-h-full pb-20 ">
      {session &&
        (session.data?.user.onboarded == "false" ||
          session.data?.user.onboarded == false) && (
          <OnboardToast
            expandSidebar={() => setonboardExpand((prev) => !prev)}
            expand={onboardExpand}
          />
        )}
      {/* Top navbar */}
      {/* env updated */}
      <div className="w-full px-4 md:px-10 mt-7">
        <FormCreatModal
          workspace_id={currentWorkspace?.workspace_id}
          user_id={session?.data?.user?.user_id}
          isOpen={isOpen}
          onClose={() => setIsOpen((prev) => !prev)}
          onConfirm={(form: any) => {}}
        />
        <MemberInviteModal
          workspace_id={currentWorkspace?.workspace_id}
          organizationId={currentOrganization?.organization_id}
          isOpen={isInviteModalOpen}
          onClose={() => setInviteModalIsOpen((prev) => !prev)}
          invitedBy={session?.data?.user?.user_id}
        />

        <div className="w-full flex md:flex-row flex-col md:items-center mb-10 gap-5  justify-between">
          <p className="text-left text-xl text-[#0f0f0f]">
            Recents
            <span className="block text-sm text-[#636363] font-light">
              check out recently edited forms
            </span>
          </p>
        </div>
        {fetching ? (
          <div className="w-full grid  grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="p-8 rounded-2xl shadow-lg cursor-pointer bg-[#f5f5f5] flex flex-row gap-5 items-start justify-between"
              >
                <div className="w-1/2">
                  <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                    workspace?.name
                  </Skeleton>
                  <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                    workspace?.description
                  </Skeleton>
                </div>
                <div className="text-gray-500 flex flex-col items-end justify-between w-1/2 h-full">
                  <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                    workspace?.name
                  </Skeleton>
                  <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                    workspace?.description
                  </Skeleton>
                </div>
              </Skeleton>
            ))}
          </div>
        ) : !recentForms || (recentForms && recentForms?.length != 0) ? (
          <div className="w-full grid  grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 md:gap-8">
            {!recentForms || (recentForms && recentForms?.length < 0)
              ? Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="p-8 rounded-2xl shadow-md cursor-pointer bg-[#f5f5f5] flex flex-row gap-5 items-start justify-between"
                  >
                    <div className="w-1/2">
                      <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                        workspace?.name
                      </Skeleton>
                      <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                        workspace?.description
                      </Skeleton>
                    </div>
                    <div className="text-gray-500 flex flex-col items-end justify-between w-1/2 h-full">
                      <Skeleton className="bg-white w-1/2 text-transparent font-serif text-xl font-semibold">
                        workspace?.name
                      </Skeleton>
                      <Skeleton className="bg-white w-3/4 mt-5  text-transparent">
                        workspace?.description
                      </Skeleton>
                    </div>
                  </Skeleton>
                ))
              : recentForms?.length > 0 &&
                recentForms?.map((workspace: any) => (
                  <div
                    key={workspace.form_id}
                    onClick={(e: any) => {
                      if (e.target.closest("#form-controls")) return;
                      router.push(
                        `https://form-x-eight.vercel.app/form/${
                          workspace.form_id +
                          `${!workspace?.published ? "/edit" : ""}`
                        }`
                      );
                    }}
                    className="p-4 md:p-8 relative rounded-xl md:rounded-2xl cursor-pointer bg-[#f5f5f5] hover:bg-[#e9e9e9] flex flex-col gap-5 md:gap-2 md:flex-row items-start justify-between"
                  >
                    <p className="bg-[#e8e8e8] md:hidden block absolute top-4 right-4 px-2 text-sm rounded-md text-gray-400">
                      draft
                    </p>
                    <div>
                      <p className="md:text-xl font-[500] text-[#0f0f0f]">
                        {workspace?.title}
                      </p>
                      <p className="text-xs md:text-sm md:mt-3 font-light text-[#636363]">
                        {workspace?.description}
                      </p>
                    </div>
                    <div
                      id="form-controls"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 flex flex-col items-end justify-between w-fit h-full ml-auto md:ml-0"
                    >
                      <div className="flex flex-row items-center justify-end gap-2">
                        {!workspace?.published && (
                          <p className="bg-[#e8e8e8] md:block hidden px-2 text-sm rounded-md text-gray-400">
                            draft
                          </p>
                        )}
                        <p className="text-xs font-light text-gray-400 text-right">
                          <TimerIcon className="inline ml-2 mb-1" size={15} />{" "}
                          last edited{" "}
                          {workspace?.updated_at &&
                            formatTimeAgo(workspace?.updated_at)}
                        </p>
                      </div>
                      <div className="flex flex-row w-fit font-light text-[#636363] text-xs md:text-base  items-center justify-between">
                        <button
                          onClick={() => {
                            router.push(
                              `https://form-x-eight.vercel.app/form/${
                                workspace.form_id + "/edit"
                              }`
                            );
                          }}
                          className="w-full flex flex-row items-center px-2  text-xs  md:text-sm  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-1"
                        >
                          <PencilIcon className="inline" size={13} /> edit
                        </button>
                        <button
                          // disabled={!currentWorkspace?.api_enabled}
                          title="copy"
                          className="w-full flex flex-row relative left-[1.5px] items-center  px-2 text-xs  md:text-sm  rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-1"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            if (!workspace?.published) {
                              toast({
                                title: "Form is not published!",
                                variant: "destructive",
                              });
                            } else {
                              setisAPIcopied(true);
                              copyToClipBoard(
                                `https://form-x-eight.vercel.app/forms/${workspace?.form_id}`
                              );
                            }
                          }}
                        >
                          <Link2Icon className="inline -rotate-45" size={13} />{" "}
                          copy
                        </button>
                        <button
                          onClick={() => {
                            setFormDeleteDialogOpen((prev: any) => ({
                              ...prev,
                              form_id: workspace?.form_id,
                              open: true,
                            }));
                          }}
                          className="w-full flex flex-row mr-2 items-center  px-2  text-xs  md:text-sm rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-1"
                        >
                          <TrashIcon
                            className="inline relative left-[2px]"
                            size={12}
                          />{" "}
                          delete
                        </button>
                        <Popover>
                          <PopoverTrigger>
                            <Ellipsis
                              className=" hover:bg-white rounded-md"
                              color="#8f8f8f"
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-[150px] mr-2 pr-1 pl-3 py-2">
                            <div className="flex flex-col items-start justify-between gap-3">
                              <button
                                className="w-full flex flex-row items-center   px-2  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-2"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event bubbling
                                  if (!workspace?.published) {
                                    toast({
                                      title: "Form is not published!",
                                      variant: "destructive",
                                    });
                                  } else {
                                    setisAPIcopied(true);
                                    copyToClipBoard(
                                      `https://form-x-eight.vercel.app/forms/${workspace?.form_id}`
                                    );
                                  }
                                }}
                              >
                                <Link2Icon
                                  className="inline -rotate-45"
                                  size={15}
                                />{" "}
                                copy
                              </button>

                              <button
                                className="w-full flex flex-row items-center  p-1 px-2  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-2"
                                onClick={(e) => {
                                  setFormRenameDialogOpen({
                                    name: workspace?.title,
                                    open: true,
                                    form_id: workspace?.form_id,
                                  });
                                }}
                              >
                                <PencilIcon
                                  className="inline -rotate-45"
                                  size={15}
                                />{" "}
                                rename
                              </button>
                              <Dialog
                                open={duplicateDialogopen}
                                onOpenChange={(e) => setduplicateDialogopen(e)}
                              >
                                <DialogTrigger asChild>
                                  <button className="w-full flex flex-row items-center  p-1 px-2  rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-2">
                                    <Copy className="inline" size={15} />{" "}
                                    duplicate
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Duplicate form</DialogTitle>
                                    <DialogDescription>
                                      Are you sure to duplicate this form?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="w-full flex flex-row items-center justify-between">
                                    <Button
                                      onClick={() =>
                                        setduplicateDialogopen(false)
                                      }
                                      type="button"
                                      className="outline"
                                      variant={"destructive"}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        duplicateForm(workspace?.form_id)
                                      }
                                      type="button"
                                      disabled={isDuplicating}
                                    >
                                      {isDuplicating && (
                                        <Loader2Icon
                                          className="inline mr-2 animate-spin"
                                          size={16}
                                        />
                                      )}{" "}
                                      Duplicate
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <button
                                onClick={() => {
                                  setFormDeleteDialogOpen((prev: any) => ({
                                    ...prev,
                                    form_id: workspace?.form_id,
                                    open: true,
                                  }));
                                }}
                                className="w-full flex flex-row items-center p-1 px-2 rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-2"
                              >
                                <TrashIcon className="inline" size={15} />{" "}
                                delete
                              </button>

                              <p
                                onClick={() => {
                                  // showFormDetails(workspace);
                                }}
                                className="w-full flex flex-row items-center  p-1 px-2  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-3"
                              >
                                <PencilIcon className="inline" size={15} /> edit
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="flex-1 h-1/2 mt-52 flex flex-col items-center gap-4 justify-center">
            <Link
              href={`https://form-x-eight.vercel.app/workspaces/${workspaces[0]?.workspace_id}?create_form=true`}
            >
              <button
                onClick={() => {
                  if (
                    session &&
                    (session.data.user.onboarded == "false" ||
                      session.data.user.onboarded == false)
                  ) {
                    // expandSidebar();
                  } else {
                    // setIsOpen((prev) => !prev);
                  }
                }}
                className="text-white/90 shadow-md shadow-black font-dmsans font-semibold  bg-[#343434] rounded-lg p-3 px-4 text-md scale-[0.97] transition-transform ease-out duration-200 "
              >
                Create your first form{" "}
                <span className="inline ml-2 text-lg">⚡</span>
              </button>
            </Link>
          </div>
        )}
      </div>
      <Dialog
        open={formRenameDialogOpen?.open}
        onOpenChange={(e) => {
          setFormRenameDialogOpen((prev: any) => ({
            name: "",
            form_id: null,
            open: e,
          }));
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Form</DialogTitle>
            <DialogDescription>
              Make changes to your form name and save it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Form Name
              </Label>
              <Input
                id="name"
                defaultValue={formRenameDialogOpen?.name}
                className="col-span-3"
                onChange={(e) => {
                  setFormRenameDialogOpen((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={isRenamingForm}
              onClick={renameForm}
            >
              {isRenamingForm && (
                <Loader size={15} className="animate-spin mr-2" />
              )}{" "}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={formDeleteDialogOpen?.open}
        onOpenChange={(e) => {
          setFormDeleteDialogOpen((prev: any) => ({
            ...prev,
            open: e,
          }));
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete form</DialogTitle>
            <DialogDescription>
              Are you sure to delete this form?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-row items-center justify-between">
            <Button
              onClick={() =>
                setFormDeleteDialogOpen({
                  open: false,
                  form_id: null,
                })
              }
              type="button"
              className="outline"
              variant={"destructive"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteForm()}
              type="button"
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2Icon className="inline mr-2 animate-spin" size={16} />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
