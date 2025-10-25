"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const FormDetailsModal = ({
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
    setformDetails((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[95vw] h-[95vh] ">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
