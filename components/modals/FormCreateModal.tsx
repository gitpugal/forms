"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "../ui/use-toast";

export const FormCreatModal = ({
  isOpen,
  onClose,
  workspace_id,
  user_id,
  onConfirm,
}: any) => {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [formDetails, setformDetails] = useState({
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

  const createform = async (e: any) => {
    let errortext = "";
    if (formDetails?.name?.length < 1) {
      errortext += "Form name must not be empty, ";
    }
    if (formDetails?.description?.length < 1) {
      errortext += "Form description must not be empty.";
    }
    if (errortext?.length > 0) {
      toast({
        title: errortext,
        description: "Please provide valid form details.",
        duration: 5000,
        variant: "destructive",
      });
      errortext = "";
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("https://form-x-eight.vercel.app/api/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formDetails,
          workspace_id: workspace_id,
          user_id: user_id,
        }),
      });

      if (res.ok) {
        setIsLoading(false);
        console.log(res);
        const data = await res.json();
        console.log(data);
        toast({
          title: "Form created successfully!",
          description: "Form created and added to this workspace",
          duration: 5000,
        });
        setformDetails({
          name: "",
          description: "",
        });
        onConfirm(data?.form);
        onClose();
      } else {
        const { message } = await res.json();
        toast({
          title: message?.includes("Unique")
            ? "Already a form with same title exists"
            : message,
          variant: "destructive",
          description: message?.includes("trash")
            ? "Either delete or restore the form with same in trash"
            : "Try again with different title!",
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
        variant: "destructive",
      });
    }
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setformDetails((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      title="New Form"
      description="Add a new Form to your Workspace."
      isOpen={isOpen}
      onClose={() => {
        setformDetails({
          name: "",
          description: "",
        });
        onClose();
      }}
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
          value={formDetails.name}
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
          value={formDetails.description}
          onChange={changeHandler}
        />
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          variant="outline"
          onClick={() => {
            setformDetails({
              name: "",
              description: "",
            });
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant="default" disabled={isLoading} onClick={createform}>
          Create
        </Button>
      </div>
    </Modal>
  );
};
