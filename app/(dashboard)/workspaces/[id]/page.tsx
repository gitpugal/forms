"use client";
import organizationService from "@/app/services/organization";
import { FormCreatModal } from "@/components/modals/FormCreateModal";
import MemberInviteModal from "@/components/modals/MemberInviteModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Copy,
  Ellipsis,
  Link2Icon,
  Loader,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  TimerIcon,
  TrashIcon,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

const page = ({ params }: { params: { id: string } }) => {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const createForm = searchParams?.get("create_form");
  const [isInviteModalOpen, setInviteModalIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [currentWorkspace, setcurrentWorkspace]: any = useState(null);
  const [currentOrganization, setcurrentOrganization]: any = useState(null);
  const [isDuplicating, setisDuplicating] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);
  const [deleteDialogopen, setdeleteDialogopen] = useState(false);
  const [duplicateDialogopen, setduplicateDialogopen] = useState(false);
  const [isRenaming, setRenaming] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isFetchingOrganisations, setisFetchingOrganisations] = useState(false);

  const { toast } = useToast();
  const [CreatForm, setCreatForm] = useState(false);
  const [isMovingForm, setisMovingForm] = useState(false);
  const [workspaces, setWorkSpaces]: any = useState(null);
  const [workspaceRenameDialogOpen, setWorkspaceRenameDialogOpen] = useState({
    open: false,
    workspace_id: null,
    name: "",
  });
  const [formDeleteDialogOpen, setFormDeleteDialogOpen] = useState({
    open: false,
    form_id: null,
  });

  const [formRenameDialogOpen, setFormRenameDialogOpen] = useState({
    open: false,
    form_id: null,
    name: "",
  });

  const [formMoveDialogOpen, setFormMoveDialogOpen] = useState({
    open: false,
    form_id: null,
    workspace_id: null,
  });
  const [isRenamingForm, setRenamingForm] = useState(false);
  const organizationservice: any = new organizationService();

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

  const updateData = () => {
    localStorage?.setItem("fetchdata", "true");
    const event: any = new Event("storage");
    event.key = "fetchdata";
    event.newValue = "true";
    window.dispatchEvent(event);
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
        setcurrentWorkspace((prev: any) => ({
          ...prev,
          forms: [form, ...prev?.forms],
        }));
        updateData();
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
        toast({
          title: "Form deleted",
          description: "Form deleted sucessfully !",
          duration: 2000,
        });
        setcurrentWorkspace((prev: any) => ({
          ...prev,
          forms: prev?.forms?.filter(
            (form: any) => form?.form_id != formDeleteDialogOpen?.form_id
          ),
        }));
        setFormDeleteDialogOpen({
          open: false,
          form_id: null,
        });
        updateData();
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

  const renameWorkspace = async () => {
    try {
      setRenaming(true);
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/renameWorkspace",
        {
          method: "PUT",
          body: JSON.stringify({
            workspace_id: workspaceRenameDialogOpen?.workspace_id,
            title: workspaceRenameDialogOpen?.name,
          }),
        }
      );

      if (response.ok) {
        setRenaming(false);
        const data = await response.json();
        toast({
          title: "Workpspace renamed",
          description: "Workpspace renamed sucessfully !",
          duration: 2000,
        });
        setcurrentWorkspace((prev: any) => ({
          ...prev,
          name: workspaceRenameDialogOpen?.name,
        }));
        setWorkspaceRenameDialogOpen({
          open: false,
          name: "",
          workspace_id: null,
        });
        updateData();
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
      setRenaming(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot delete this form try again!",
        duration: 2000,
      });
    }
    setRenaming(false);
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
        setcurrentWorkspace((prev: any) => ({
          ...prev,
          forms: prev?.forms?.map((form: any) => {
            if (form?.form_id == formRenameDialogOpen?.form_id) {
              return { ...form, title: formRenameDialogOpen?.name };
            }
            return form;
          }),
        }));
        updateData();
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

  const moveForm = async () => {
    try {
      setisMovingForm(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/moveForm", {
        method: "PUT",
        body: JSON.stringify({
          form_id: formMoveDialogOpen?.form_id,
          workspace_id: formMoveDialogOpen?.workspace_id,
        }),
      });

      if (response.ok) {
        setisMovingForm(false);
        const data = await response.json();
        toast({
          title: "Form moved",
          description: "Form moved sucessfully !",
          duration: 2000,
        });
        setcurrentWorkspace((prev: any) => ({
          ...prev,
          forms: prev?.forms?.filter(
            (form: any) => form?.form_id != formMoveDialogOpen?.form_id
          ),
        }));
        setFormMoveDialogOpen({
          open: false,
          workspace_id: null,
          form_id: null,
        });
        localStorage?.setItem("fetchdata", "true");
        const event: any = new Event("storage");
        event.key = "fetchdata";
        event.newValue = "true";
        window.dispatchEvent(event);
      } else {
        const { message } = await response.json();

        toast({
          title: message || "Cannot move form try again",
          variant: "destructive",
          description: "Cannot move this form try again!",
          duration: 2000,
        });
      }
    } catch (error) {
      setisMovingForm(false);
      toast({
        title: "An error occured",
        variant: "destructive",
        description: "Cannot move this form try again!",
        duration: 2000,
      });
    }
    setRenamingForm(false);
  };

  const openProModal = () => {
    localStorage?.setItem("formflowpromodal", "true");
    const event: any = new Event("storage");
    event.key = "formflowpromodal";
    event.newValue = "true";
    window.dispatchEvent(event);
  };
  const fetchData = async () => {
    try {
      setFetching(true);
      const curorg = localStorage?.getItem("formflowcurrenorganisation");
      setcurrentOrganization(curorg);
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
        setFetching(false);
        setCreatForm(createForm ? true : false);
      } else {
        setFetching(false);
      }
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  const fetchingOrganisationsData = async () => {
    try {
      setisFetchingOrganisations(true);
      const data: any = await organizationservice.getUserOrganizations(
        session?.user?.user_id,
        null,
        "order"
      );
      if (localStorage?.getItem("formflowcurrenorganisation")) {
        const curorgid = localStorage?.getItem("formflowcurrenorganisation");
        const curorg = data?.organizations?.find(
          (org: any) => org?.organization_id == curorgid
        );
        console.log(data);
        console.log(curorgid);
        if (curorg != undefined && curorg) {
          console.log(curorg);
          setWorkSpaces(curorg?.workspaces);
        }
      }
      setisFetchingOrganisations(false);
      console.log(data);
      if (CreatForm) {
        setCreatForm(createForm ? true : false);
      }
    } catch (error) {
      setisFetchingOrganisations(false);
    }
  };

  useEffect(() => {
    if (!fetching && status == "authenticated" && !workspaces) {
      fetchData();
      fetchingOrganisationsData();
    }
  }, [session, status]);

  useEffect(() => {
    const handleStorageChange = (event: any) => {
      if (event.key == "formflowcurrenorganisation") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }, []);
  return (
    <div className="w-full min-h-full py-10 pb-20 px-4 md:p-10 md:pt-7">
      <FormCreatModal
        workspace_id={currentWorkspace?.workspace_id}
        user_id={session?.user?.user_id}
        isOpen={CreatForm || isOpen}
        onClose={() => {
          setIsOpen(false);
          if (CreatForm) {
            setCreatForm(false);
            router.push(`/workspaces/${params.id}`);
          }
          setCreatForm(false);
        }}
        onConfirm={(form: any) => {
          setcurrentWorkspace((prev: any) => ({
            ...prev,
            forms: [form, ...prev?.forms],
          }));
          localStorage?.setItem("fetchdata", "true");
          const event: any = new Event("storage");
          event.key = "fetchdata";
          event.newValue = "true";
          window.dispatchEvent(event);
          setCreatForm(false);
          setIsOpen(false);
          if (createForm) {
            router.push(`https://form-x-eight.vercel.app/workspaces/${params.id}`);
          }
        }}
      />
      <MemberInviteModal
        workspace_id={currentWorkspace?.workspace_id}
        organizationId={currentOrganization}
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalIsOpen(false)}
        invitedBy={session?.user?.user_id}
      />

      <div className="w-full flex md:flex-row flex-col md:pb-0 pb-3 md:items-center mb-14 gap-5 justify-between">
        {currentWorkspace ? (
          <div className="flex flex-row items-stretch  justify-between gap-2">
            <p className="text-left text-xl text-[#0f0f0f]">
              {currentWorkspace?.name}
              <span className="block text-sm opacity-60 font-light">
                {currentWorkspace?.description}
              </span>
            </p>
            <Popover>
              <PopoverTrigger>
                <div className=" bg-white rounded-md px-2 py-2 my-auto border">
                  <Ellipsis />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[150px] mr-2 pr-1 pl-3 py-2">
                <p
                  onClick={() =>
                    setWorkspaceRenameDialogOpen({
                      open: true,
                      workspace_id: currentWorkspace?.workspace_id,
                      name: currentWorkspace?.name,
                    })
                  }
                  className="cursor-pointer"
                >
                  rename
                </p>
              </PopoverContent>
            </Popover>
          </div>
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

        <div className="flex justify-end flex-row md:items-center md:justify-center gap-2">
          <button
            disabled={
              !currentWorkspace?.collaborators?.find(
                (collab: any) =>
                  collab?.users?.email == session?.user?.email &&
                  (collab?.role == "admin" || collab?.role == "orgadmin")
              )
            }
            onClick={() => {
              if (!session?.user?.pro || session?.user?.pro == "false") {
                openProModal();
              } else {
                setInviteModalIsOpen((prev) => !prev);
              }
            }}
            className="bg-[#f5f5f5] text-[#0f0f0f] rounded-lg p-3 text-sm md:text-md hover:scale-95 transition-transform ease-out duration-200 "
          >
            Add member
            <UserPlus
              className="inline ml-2 mb-[2px] text-[#1d1d1d] "
              size={16}
            />
          </button>
          <button
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            className="text-white bg-[#343434] rounded-lg p-3 text-sm md:text-md scale-[0.97] transition-transform ease-out duration-200 "
          >
            New form
            <PlusIcon className="inline ml-2 mb-[2px]" size={16} />
          </button>
        </div>
      </div>
      {!currentWorkspace ||
      (currentWorkspace && currentWorkspace?.forms?.length != 0) ? (
        <div className="w-full grid mt-5 grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
          {!currentWorkspace ||
          (currentWorkspace && currentWorkspace?.forms?.length < 0)
            ? Array.from({ length: 5 }).map((_, index) => (
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
            : currentWorkspace?.forms?.length > 0 &&
              currentWorkspace?.forms?.map((workspace: any) => (
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
                  className="p-4 md:p-8 rounded-xl relative md:rounded-2xl cursor-pointer bg-[#f5f5f5] hover:bg-[#e9e9e9] flex flex-col gap-5 md:gap-2 md:flex-row items-start justify-between"
                >
                  <p className="md:hidden block absolute top-4 right-4 bg-[#e8e8e8] px-[6px] md:px-2 text-sm rounded-sm md:rounded-md text-gray-400">
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
                        <p className="md:block hidden bg-[#e8e8e8] px-2 text-sm rounded-md text-gray-400">
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
                        disabled={!workspace?.published}
                        title="copy"
                        className="w-full flex flex-row relative left-[1.5px] items-center  px-2 text-xs  md:text-sm  rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-1"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling
                          setisAPIcopied(true);
                          copyToClipBoard(
                            `https://form-x-eight.vercel.app/forms/${workspace?.form_id}`
                          );
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
                              disabled={!currentWorkspace?.api_enabled}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                setisAPIcopied(true);
                                copyToClipBoard(
                                  `https://form-x-eight.vercel.app/forms/${workspace?.form_id}`
                                );
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
                              <TrashIcon className="inline" size={15} /> delete
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
        <div className="flex-1 h-1/2 mt-20 md:mt-40 flex flex-col items-center gap-4 justify-center">
          <p className="text-sm font-semibold to-gray-500">
            No forms in this workspace
          </p>
          <button
            onClick={() => {
              // if (
              //   session &&
              //   (session?.data?.user?.onboarded == "false" ||
              //     session?.data?.user?.onboarded == false)
              // ) {
              //   // expandSidebar();
              // } else {
              setIsOpen(true);
              // }
            }}
            className="text-white/90 shadow-md shadow-black font-dmsans font-semibold  bg-[#343434] rounded-lg p-3 px-4 text-md scale-[0.97] transition-transform ease-out duration-200 "
          >
            Create your first form{" "}
            <span className="inline ml-2 text-lg">⚡</span>
          </button>
        </div>
      )}

      <Dialog
        open={workspaceRenameDialogOpen?.open}
        onOpenChange={(e) => {
          setWorkspaceRenameDialogOpen((prev: any) => ({
            name: "",
            workspace_id: null,
            open: e,
          }));
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
            <DialogDescription>
              Make changes to your workspace name and save it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Workspace Name
              </Label>
              <Input
                id="name"
                defaultValue={workspaceRenameDialogOpen?.name}
                className="col-span-3"
                onChange={(e) => {
                  setWorkspaceRenameDialogOpen((prev: any) => ({
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
              disabled={isRenaming}
              onClick={renameWorkspace}
            >
              {isRenaming && <Loader size={15} className="animate-spin mr-2" />}{" "}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        open={formMoveDialogOpen?.open}
        onOpenChange={(e) => {
          setFormMoveDialogOpen((prev: any) => ({
            form_id: null,
            open: e,
            workspace_id: null,
          }));
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Form</DialogTitle>
            <DialogDescription>
              Select an target Workpspace that you want to move this form.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-start justify-start gap-2 py-4">
            {isFetchingOrganisations ? (
              <Loader2Icon className="animate-spin mx-auto my-auto" />
            ) : (
              workspaces
                ?.filter(
                  (workspace: any) => workspace?.workspace_id != params?.id
                )
                ?.map((workspace: any) => (
                  <div
                    onClick={() => {
                      setFormMoveDialogOpen((prev) => ({
                        ...prev,
                        workspace_id:
                          prev?.workspace_id == workspace?.workspace_id
                            ? null
                            : workspace?.workspace_id,
                      }));
                    }}
                    className={`w-full px-7 py-3 cursor-pointer rounded-md border ${
                      workspace?.workspace_id ==
                        formMoveDialogOpen?.workspace_id &&
                      "border-green-400 text-green-500"
                    }`}
                  >
                    <p className="font-semibold opacity-70 italic">
                      {workspace.name}
                    </p>
                  </div>
                ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={isMovingForm || !formMoveDialogOpen?.workspace_id}
              onClick={moveForm}
            >
              {isMovingForm && (
                <Loader size={15} className="animate-spin mr-2" />
              )}{" "}
              Move
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

export default page;
