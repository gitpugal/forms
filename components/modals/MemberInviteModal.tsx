"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "../ui/use-toast";

const MemberInviteModal = ({
  isOpen,
  onClose,
  organizationId,
  invitedBy,
  workspace_id,
}: any) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isInviting, setisInviting] = useState(false);
  const { toast } = useToast();
  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handleInvite = async (e: any) => {
    e.preventDefault();
    try {
      setisInviting(true);
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
          organizationId,
          invitedBy,
          workspace_id,
        }),
      });

      const { message } = await response.json();
      toast({
        title: response.ok ? "Invitation Sent" : "Can't Invite",
        description: message,
        variant: response.ok ? "default" : "destructive",
        duration: 5000,
      });

      if (response.ok) {
        setEmail("");
        onClose();
        setRole("member")
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "An Error occured. Try again later!",
        variant: "destructive",
      });
      setisInviting(false);
    }
    setisInviting(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" ">
        <DialogHeader className="h-full m-0">
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>
            Invite an member to this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full  h-full">
          <form
            onSubmit={handleInvite}
            className="h-full w-full flex flex-col items-start justify-start gap-5"
          >
            <Label>User email</Label>
            <Input
              required
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={isInviting} type="submit">
              Invite
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
