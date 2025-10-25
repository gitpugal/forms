"use client";
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Ellipsis,
  Link2Icon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { FormCreatModal } from "./modals/FormCreateModal";
import MemberInviteModal from "./modals/MemberInviteModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WorksSpaceList = ({
  fetchWorkspace,
  currentWorkspace,
  expandSidebar,
  addFormToWorkspace,
  showFormDetails,
  currentOrganization,
  deleteFromWorkSpace,
}: {
  fetchWorkspace: () => void;
  currentWorkspace: any;
  expandSidebar: () => void;
  addFormToWorkspace: (arg1: any, arg2: string) => void;
  deleteFromWorkSpace: (arg1: any, arg2: string) => void;
  showFormDetails: (arg1: any) => void;
  currentOrganization: any;
}) => {
  const session: any = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [isDuplicating, setisDuplicating] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);
  const [deleteDialogopen, setdeleteDialogopen] = useState(false);
  const [duplicateDialogopen, setduplicateDialogopen] = useState(false);
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
        addFormToWorkspace(form, currentWorkspace?.workspace_id);
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

  const deleteForm = async (formToDuplicate: string) => {
    try {
      setisDeleting(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/form", {
        method: "DELETE",
        body: JSON.stringify({ form_id: formToDuplicate, move_to_trash: true }),
      });

      if (response.ok) {
        setisDeleting(false);
        const { form } = await response.json();
        deleteFromWorkSpace(form, currentWorkspace?.workspace_id);
        toast({
          title: "Form deleted",
          description: "Form deleted sucessfully !",
          duration: 2000,
        });
        setdeleteDialogopen(false);
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
  return (
    <div className="w-full h-full py-10 px-4 md:p-10 mt-5">
      <FormCreatModal
        workspace_id={currentWorkspace?.workspace_id}
        user_id={session?.data?.user?.user_id}
        isOpen={isOpen}
        onClose={() => setIsOpen((prev) => !prev)}
        onConfirm={(form: any) => {
          addFormToWorkspace(form, currentWorkspace?.workspace_id);
        }}
      />
      <MemberInviteModal
        workspace_id={currentWorkspace?.workspace_id}
        organizationId={currentOrganization?.organization_id}
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalIsOpen((prev) => !prev)}
        invitedBy={session?.data?.user?.user_id}
      />

      <div className="w-full pb-5 border-b flex md:flex-row flex-col md:items-center mb-14 gap-5  justify-between">
        {currentWorkspace ? (
          <p className="font-semibold text-left text-xl text-gray-500">
            {currentWorkspace?.name}
            <span className="block text-sm opacity-60 font-normal">
              {currentWorkspace?.description}
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
        <div className="flex flex-row md:items-center md:justify-center gap-2">
          <Button
            variant="outline"
            disabled={
              !currentWorkspace?.collaborators?.find(
                (collab: any) =>
                  collab?.users?.email == session?.data?.user?.email &&
                  collab?.role == "admin"
              )
            }
            onClick={() => {
              if (
                session &&
                (session.data.user.onboarded == "false" ||
                  session.data.user.onboarded == false)
              ) {
                expandSidebar();
              } else {
                setInviteModalIsOpen((prev) => !prev);
              }
            }}
            className="shadow-custom border border-gray-500 text-sm hover:scale-95 transition-transform ease-out duration-200 hover:bg-orange-50"
          >
            Add member
            <UserPlus className="inline ml-2 text-gray-500" size={16} />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (
                session &&
                (session.data.user.onboarded == "false" ||
                  session.data.user.onboarded == false)
              ) {
                expandSidebar();
              } else {
                setIsOpen((prev) => !prev);
              }
            }}
            className="shadow-custom border border-gray-500 text-sm hover:scale-95 transition-transform ease-out duration-200 hover:bg-orange-50"
          >
            New Form
            <PlusIcon className="inline ml-2 text-gray-500" size={16} />
          </Button>
        </div>
      </div>
      {!currentWorkspace ||
      (currentWorkspace && currentWorkspace?.forms?.length != 0) ? (
        <div className="w-full grid mt-5 grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {!currentWorkspace ||
          (currentWorkspace && currentWorkspace?.forms?.length < 0)
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="p-5 rounded-xl cursor-pointer bg-white border shadow-lg flex flex-col gap-5 items-start justify-between"
                >
                  <Skeleton className="bg-slate-200 w-full text-transparent font-serif text-xl font-semibold">
                    workspace?.name
                  </Skeleton>
                  <Skeleton className="bg-slate-200 w-4/5 text-transparent">
                    workspace?.description
                  </Skeleton>
                  <Skeleton className="bg-slate-200 w-1/2 text-transparent text-xs">
                    workspace?.created_at
                  </Skeleton>
                  <Skeleton className="bg-slate-200 w-1/2 text-transparent text-xs">
                    workspace?.created_at
                  </Skeleton>
                </Skeleton>
              ))
            : currentWorkspace?.forms?.length > 0 &&
              currentWorkspace?.forms?.map((workspace: any) => (
                <div
                  key={workspace.form_id}
                  onClick={(e: any) => {
                    if (e.target.closest("#form-controls")) return;
                    showFormDetails(workspace);
                  }}
                  className="px-5 py-3 rounded-md border-black/5 border-2 cursor-pointer bg-white border-gray-100 hover:bg-gray-50 flex flex-row items-start justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-600">
                      {workspace?.title}
                    </p>
                    <p className="text-sm mt-3 text-gray-600">
                      {workspace?.description}
                    </p>
                  </div>
                  <div
                    id="form-controls"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-500 flex flex-col items-end  justify-between w-fit h-full"
                  >
                    <p className="text-xs text-gray-400 text-right">
                      {new Date(workspace?.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-row w-fit  items-end justify-between gap-5">
                      <button
                        onClick={() => {
                          showFormDetails(workspace);
                        }}
                        className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-1"
                      >
                        <PencilIcon className="inline" size={15} /> edit
                      </button>
                      <button
                        disabled={!currentWorkspace?.api_enabled}
                        title="copy"
                        className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-1"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling
                          setisAPIcopied(true);
                          copyToClipBoard(
                            `https://form-x-eight.vercel.app/forms/${workspace?.form_id}`
                          );
                        }}
                      >
                        <Link2Icon className="inline -rotate-45" size={15} />{" "}
                        copy
                      </button>
                      <Dialog
                        open={deleteDialogopen}
                        onOpenChange={(e) => setdeleteDialogopen(e)}
                      >
                        <DialogTrigger asChild>
                          <button className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-1">
                            <TrashIcon className="inline" size={14} /> delete
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete form</DialogTitle>
                            <DialogDescription>
                              Are you sure to delete this form?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="w-full flex flex-row items-center justify-between">
                            <Button
                              onClick={() => setdeleteDialogopen(false)}
                              type="button"
                              className="outline"
                              variant={"destructive"}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => deleteForm(workspace?.form_id)}
                              type="button"
                              disabled={isDeleting}
                            >
                              {isDeleting && (
                                <Loader2Icon
                                  className="inline mr-2 animate-spin"
                                  size={16}
                                />
                              )}{" "}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Popover>
                        <PopoverTrigger>
                          <Ellipsis className="my-auto" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[150px] mr-2">
                          <div className="flex flex-col items-start justify-between gap-3">
                            <button
                              className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-3"
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
                            <Dialog
                              open={duplicateDialogopen}
                              onOpenChange={(e) => setduplicateDialogopen(e)}
                            >
                              <DialogTrigger asChild>
                                <button className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-3">
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
                            <Dialog
                              open={deleteDialogopen}
                              onOpenChange={(e) => setdeleteDialogopen(e)}
                            >
                              <DialogTrigger asChild>
                                <button className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100 justify-start gap-3">
                                  <TrashIcon className="inline" size={15} />{" "}
                                  delete
                                </button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Delete form</DialogTitle>
                                  <DialogDescription>
                                    Are you sure to delete this form?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="w-full flex flex-row items-center justify-between">
                                  <Button
                                    onClick={() => setdeleteDialogopen(false)}
                                    type="button"
                                    className="outline"
                                    variant={"destructive"}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      deleteForm(workspace?.form_id)
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
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <p
                              onClick={() => {
                                showFormDetails(workspace);
                              }}
                              className="w-full flex flex-row items-center p-1 rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-3"
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
        <div className="flex-1 h-1/2 flex flex-col items-center gap-4 justify-center">
          <p className="text-sm font-semibold to-gray-500">
            No forms in this workspace
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (
                session &&
                (session.data.user.onboarded == "false" ||
                  session.data.user.onboarded == false)
              ) {
                expandSidebar();
              } else {
                setIsOpen((prev) => !prev);
              }
            }}
            className="shadow-custom border border-gray-500 text-sm hover:scale-95 transition-transform ease-out duration-200 hover:bg-orange-50"
          >
            Create your first form{" "}
            <span className="inline ml-2 text-lg">⚡</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorksSpaceList;
