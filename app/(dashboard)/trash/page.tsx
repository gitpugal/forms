"use client";

import React, { useState, useEffect } from "react";
import { Loader2Icon, Trash, Undo2Icon } from "lucide-react";
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

const page = () => {
  const [forms, setForms]: any = useState(null);
  const { toast } = useToast();
  const [isDeleting, setisDeleting] = useState(false);
  const [deleteDialogopen, setdeleteDialogopen] = useState(false);
  const [restoreDialogopen, setrestoreDialogopen] = useState(false);
  const [curRestoreForm, setRestoreForm] = useState(null);
  const [curDeleteForm, setDeleteForm] = useState(null);

  const [isFetchingInvitations, setisFetchingInvitations] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const session = useSession();

  const restoreForm = async (formToDuplicate: string | null) => {
    try {
      setisDeleting(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/form", {
        method: "DELETE",
        body: JSON.stringify({
          form_id: formToDuplicate,
          remove_from_trash: true,
        }),
      });

      if (response.ok) {
        setisDeleting(false);
        const { form } = await response.json();
        setForms((prev: any) =>
          prev?.filter((formm: any) => formm?.form_id != formToDuplicate)
        );
        // addFormToWorkspace(form, currentWorkspace?.workspace_id);
        toast({
          title: "Form restored",
          description: "Form restored sucessfully !",
          duration: 2000,
        });
        setrestoreDialogopen(false);
        setRestoreForm(null);
      } else {
        toast({
          title: "An error occured",
          variant: "destructive",
          description: "Cannot restore this form try again!",
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

  const deleteForm = async (formToDuplicate: string | null) => {
    try {
      setisDeleting(true);
      const response = await fetch("https://form-x-eight.vercel.app/api/form", {
        method: "DELETE",
        body: JSON.stringify({
          form_id: formToDuplicate,
          deletepermenant: true,
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
        setForms((prev: any) =>
          prev?.filter((form: any) => form?.form_id != formToDuplicate)
        );
        setdeleteDialogopen(false);
        setDeleteForm(null);
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
  useEffect(() => {
    // Fetch invitations received for the current user
    const fetchInvitations = async () => {
      setisFetchingInvitations(true);
      try {
        const curorg_id = localStorage?.getItem("formflowcurrenorganisation");
        const response = await fetch(
          `/api/received-invitations?email=${session?.data?.user?.email}&org_id=${curorg_id}`
        );
        const data = await response.json();
        setInvitations(data.invitations);
        setForms(data.forms);
      } catch (error) {
        setisFetchingInvitations(false);
        console.error("Error fetching invitations:", error);
      }
      setisFetchingInvitations(false);
    };
    if (session?.data) {
      if (!isFetchingInvitations && !forms) {
        fetchInvitations();
      }
    }
  }, [session]);
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
        Trash
        <span className="block text-sm font-light text-[#636363]">
          Find recently deleted items here.
        </span>
      </p>
      <div className="w-full h-fit pb-20 mt-10  mb-20 grid grid-cols-1 gap-8 ">
        {isFetchingInvitations ? (
          Array.from({ length: 5 }).map((_, index) => (
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
        ) : (
          <>
            {" "}
            {forms && forms.length == 0 ? (
              <p className="font-light w-full mt-40 text-center my-auto">
                No forms in the trash
              </p>
            ) : (
              forms?.map((workspace: any) => (
                <div
                  key={workspace.form_id}
                  onClick={(e: any) => {
                    if (e.target.closest("#form-controls")) return;
                    // showFormDetails(workspace);
                  }}
                  className="p-4 md:p-8 rounded-xl md:rounded-2xl cursor-pointer bg-[#f5f5f5] hover:bg-[#e9e9e9] flex flex-col  md:gap-2 gap-5 md:flex-row items-start justify-between "
                >
                  <div>
                    <p className="text-xl font-[500]   text-[#0f0f0f]">
                      {workspace?.title}
                    </p>
                    <p className="text-sm md:mt-3 font-light text-[#636363]">
                      {workspace?.description}
                    </p>
                  </div>
                  <div
                    id="form-controls"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-500 flex flex-col items-end  justify-between w-fit h-full md:ml-0 ml-auto "
                  >
                    <p className="text-xs text-gray-400 text-right">
                      deleted{" "}
                      {workspace?.updated_at &&
                        formatTimeAgo(workspace?.updated_at)}
                    </p>
                    <div className="flex mt-1 md:mt-4 flex-row w-fit items-end justify-between gap-1 md:gap-5">
                      <button
                        onClick={() => {
                          setRestoreForm(workspace?.form_id);
                          setrestoreDialogopen(true);
                        }}
                        className="w-full flex flex-row items-center px-2  text-sm  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-1"
                      >
                        <Undo2Icon className="inline " size={14} /> restore
                      </button>
                      <button
                        onClick={() => {
                          setDeleteForm(workspace?.form_id);
                          setdeleteDialogopen(true);
                        }}
                        className="w-full flex flex-row items-center px-2  text-sm  rounded-sm cursor-pointer hover:bg-gray-100  justify-start gap-1"
                      >
                        <Trash className="inline  " size={14} /> delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      <Dialog
        open={restoreDialogopen}
        onOpenChange={(e) => {
          if (!e) {
            setRestoreForm(null);
          }
          setrestoreDialogopen(e);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restore form</DialogTitle>
            <DialogDescription>
              Are you sure to restore this form?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-row items-center justify-between">
            <Button
              onClick={() => {
                setrestoreDialogopen(false);
                setRestoreForm(null);
              }}
              type="button"
              className="outline"
              variant={"destructive"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => restoreForm(curRestoreForm)}
              type="button"
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2Icon className="inline mr-2 animate-spin" size={16} />
              )}{" "}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteDialogopen}
        onOpenChange={(e) => {
          if (!e) {
            setDeleteForm(null);
          }
          setdeleteDialogopen(e);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete form</DialogTitle>
            <DialogDescription>
              Are you sure to delete this form permenantly?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-row items-center justify-between">
            <Button
              onClick={() => {
                setdeleteDialogopen(false);
                setDeleteForm(null);
              }}
              type="button"
              className="outline"
              variant={"destructive"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteForm(curDeleteForm)}
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
