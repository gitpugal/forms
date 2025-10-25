"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "../ui/use-toast";

export const CreatModal = ({
  isOpen,
  onClose,
  org_id,
  user_id,
  onConfirm,
}: any) => {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [workspaceDetails, setworkspaceDetails] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const createWorkSpace = async (e: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("https://form-x-eight.vercel.app/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...workspaceDetails,
          org_id: org_id,
          user_id: user_id,
        }),
      });

      if (res.ok) {
        setIsLoading(false);
        console.log(res);
        const data = await res.json();
        console.log(data);
        toast({
          title: "Workspace created successfully!",
          description: "Workspace created and added to your organisation",
          duration: 5000,
        });
        setworkspaceDetails({
          name: "",
          description: "",
        });
        onClose();
        onConfirm(data);
      } else {
        const { message } = await res.json();
        toast({
          title: message,
          description: "An Exception occured, Try Again!",
          duration: 5000,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast({
        title: "Uh oh!, An Exception occured, Try Again later.",
        description: "It's not you, It's from us.",
        duration: 5000,
      });
    }
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setworkspaceDetails((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      title="New Workspace"
      description="Add a new workspace  to your organisation."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className=" flex flex-col mt-2 gap-2">
        <label htmlFor="projectname" className="text-md">
          Name
        </label>
        <input
          className="border focus:outline-none rounded-md px-3 py-2"
          type="text"
          placeholder="name"
          name="name"
          value={workspaceDetails?.name}
          onChange={changeHandler}
        />
      </div>
      <div className=" flex flex-col mt-2 gap-2">
        <label htmlFor="projectname" className="text-md">
          Description
        </label>
        <input
          className="border focus:outline-none rounded-md px-3 py-2"
          type="text"
          placeholder="description"
          name="description"
          value={workspaceDetails?.description}
          onChange={changeHandler}
        />
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          variant="outline"
          onClick={() => {
            setworkspaceDetails({
              name: "",
              description: "",
            });
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          disabled={isLoading}
          onClick={createWorkSpace}
        >
          Create
        </Button>
      </div>
    </Modal>
  );
};
