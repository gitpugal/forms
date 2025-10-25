"use client";
import organizationService from "@/app/services/organization";
import LogoComponent from "@/components/LogoComponent";
import { Bell, BellRing, MenuIcon, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileDashboardSidebar from "@/components/MobileDashboardSidebar";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
const TopNavbar = () => {
  const pathname = usePathname();
  const [showFormDetails, setShowFormDetails] = useState(false);
  const [open, setOpen]: any = useState(false);
  const [creatFormOpen, setcreateFormOpen]: any = useState(false);
  const [creatWorkspaceOpen, setcreatWorkspaceOpen]: any = useState(false);
  const [invitations, setInvitations]: any = useState(null);
  const [isManagingThisInvitation, setisManagingThisInvitation] =
    useState(null);
  const [organization, setorganization]: any = useState(null);
  const [forms, setForms]: any = useState(null);
  const [workspaces, setWorkspaces]: any = useState(null);
  const [isFetchingInvitations, setisFetchingInvitations] = useState(false);
  const [isSidebarOpen, setisSidebarOpen] = useState(false);
  const { toast } = useToast();
  const session: any = useSession();
  const router = useRouter();
  const organizationservice: any = new organizationService();
  const [workspaceDetails, setworkspaceDetails] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const createWorkSpace = async (e: any) => {
    setIsLoading(true);
    try {
      const curorgid = localStorage?.getItem("formflowcurrenorganisation");
      const res = await fetch("https://form-x-eight.vercel.app/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...workspaceDetails,
          org_id: curorgid,
          user_id: session?.data?.user?.user_id,
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
        router.push(
          `https://form-x-eight.vercel.app/workspaces/${data?.workspace?.workspace_id}`
        );
        setcreatWorkspaceOpen(false);
        setOpen(false);
      } else {
        const { message } = await res.json();
        toast({
          title: message,
          description: "An Exception occured, Try Again!",
          duration: 5000,
        });
        setIsLoading(false);
        setOpen(false);
        setcreatWorkspaceOpen(false);
      }
    } catch (error) {
      setcreatWorkspaceOpen(false);
      console.log(error);
      setIsLoading(false);
      toast({
        title: "Uh oh!, An Exception occured, Try Again later.",
        description: "It's not you, It's from us.",
        duration: 5000,
      });
    }
  };
  const handleAcceptInvitation = async (invitation: any) => {
    try {
      const response = await fetch("/api/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitation: invitation,
          decision: "accept",
        }),
      });

      const data: any = await organizationservice.getUserOrganizations(
        session?.data?.user?.user_id
      );
      console.log(data);
      setorganization(data?.organizations);
      const { message } = await response.json();
      toast({
        title: response.ok ? "Invitation Accepted" : "Error",
        description: message,
        variant: response.ok ? "default" : "destructive",
        duration: 5000,
      });

      // Update invitations list after accepting invitation
      setInvitations(
        invitations?.filter(
          (inv: any) => inv.invitation_id !== invitation?.invitation_id
        )
      );
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleDeclineInvitation = async (invitation: any) => {
    try {
      const response = await fetch("/api/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitation: invitation,
          descision: "decline",
        }),
      });

      const { message } = await response.json();
      toast({
        title: response.ok ? "Invitation Declined" : "Error",
        description: message,
        variant: response.ok ? "default" : "destructive",
        duration: 5000,
      });

      // Update invitations list after declining invitation
      setInvitations(
        invitations?.filter(
          (inv: any) => inv.invitation_id !== invitation?.invitation_id
        )
      );
    } catch (error) {
      console.error("Error declining invitation:", error);
    }
  };

  const fetchInvitations = async () => {
    setisFetchingInvitations(true);
    try {
      const curorgid = localStorage?.getItem("formflowcurrenorganisation");
      const response = await fetch(
        `/api/received-invitations?email=${session?.data?.user?.email}&org_id=${curorgid}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setInvitations(data.invitations);
        console.log(forms);
        setForms(data?.forms);
        setWorkspaces(data?.workspaces);
        setisFetchingInvitations(false);
      } else {
        setisFetchingInvitations(false);
      }
    } catch (error) {
      setisFetchingInvitations(false);
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    if (!isFetchingInvitations && session?.data && !invitations) {
      fetchInvitations();
    }
  }, [session]);

  useEffect(() => {
    if (isSidebarOpen) {
      setisSidebarOpen(false);
    }
  }, [pathname]);
  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setworkspaceDetails((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div
      className={` bg-white absolute top-0 left-0 h-fit border-b-2 border-[#f5f5f5] w-full p-5 md:p-2 md:pr-16 overflow-hidden flex transition-all duration-1000 ease-in-out flex-row items-center  justify-between`}
    >
      <div className="grid grid-cols-2 bg-red-50 gap-2">
        {/* {session?.data?.user?.pro && (
          <button className="bg-green-500 px-3 text-sm font-light py-[3px] rounded-3xl text-white">
            Pro Active
          </button>
        )} */}
        <Sheet
          open={isSidebarOpen}
          onOpenChange={(e: boolean) => {
            setisSidebarOpen(e);
          }}
        >
          <SheetTrigger>
            <MenuIcon className="block md:hidden" />
          </SheetTrigger>
          <SheetContent side={"left"} className="block md:hidden p-0">
            <MobileDashboardSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <LogoComponent
        className={` ${
          showFormDetails ? "opacity-0" : "opacity-100"
        } transition-opacity duration-500  ease-in-out relative right-0 md:right-[10px]`}
      />

      <div className="flex items-center justify-between gap-5">
        <Dialog
          open={open}
          onOpenChange={(e) => {
            setOpen(e);
          }}
        >
          <DialogTrigger className="text-gray-600 mt-1 bg-gray-50 px-4 py-1 rounded-md">
            <Search className="inline" size={15} /> search
          </DialogTrigger>
          <DialogContent className="p-0">
            <Command className=" my-auto bg-gray-50 border">
              <CommandInput placeholder="search for commands" />
              <CommandList className="custom-scrollbar">
                <CommandGroup heading="Actions">
                  <CommandList>
                    <CommandItem className="cursor-pointer relative">
                      + create a form
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setcreateFormOpen(true);
                          setOpen(false);
                        }}
                        className="w-full h-full absolute top-0 left-0 z-10"
                      ></div>
                    </CommandItem>
                    <CommandItem className="cursor-pointer relative">
                      + create a Workpspace
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setcreatWorkspaceOpen(open);
                        }}
                        className="w-full h-full absolute top-0 left-0 z-10"
                      ></div>
                    </CommandItem>
                  </CommandList>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Forms">
                  <CommandList>
                    {forms?.map((form: any) => (
                      <CommandItem className="cursor-pointer">
                        <button
                          className="w-full h-full text-left p-1"
                          onClick={() => {
                            setcreateFormOpen(false);
                            router.push(
                              `https://form-x-eight.vercel.app/form/${form?.form_id}`
                            );
                            setOpen(false);
                          }}
                        >
                          {form?.title}
                        </button>
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Workspaces">
                  <CommandList>
                    {workspaces?.map((workspace: any) => (
                      <CommandItem className="cursor-pointer">
                        <button
                          className="w-full h-full text-left p-1"
                          onClick={() => {
                            router.push(
                              `https://form-x-eight.vercel.app/workspaces/${workspace?.workspace_id}`
                            );
                            setOpen(false);
                          }}
                        >
                          {workspace?.name}
                        </button>
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger>
            <div className="relative  cursor-pointer h-fit w-fit">
              <Bell
                className={`font-semibold rotate-45 transition-opacity duration-500 ease-in-out mt-1 text-left text-xl text-gray-500`}
              />
              {invitations && invitations?.length > 0 && (
                <>
                  <div className="w-3 h-3 bg-orange-500 animate-ping rounded-full absolute -top-2 -left-2"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full absolute -top-2 -left-2"></div>
                </>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="min-w-[30vw] mr-3">
            <p className="mb-5 font-semibold">Notifications</p>
            <div className="h-full w-full flex flex-col items-start justify-start gap-5">
              {invitations?.map((invitation: any) => (
                <div
                  key={invitation?.invitation_id}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 w-full text-left text-sm transition-all "
                  )}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          You have an invitation
                        </div>
                      </div>
                      <div
                        className={cn("ml-auto text-xs text-muted-foreground")}
                      ></div>
                    </div>
                    <div className="text-xs font-medium">
                      <span className="font-semibold">
                        {invitation?.users?.email}
                      </span>{" "}
                      from{" "}
                      <span className="font-semibold">
                        {invitation?.organizations?.name}
                      </span>{" "}
                      organization invited you
                    </div>
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    to join{" "}
                    <span className="font-semibold">
                      {invitation?.workspaces?.name}
                    </span>{" "}
                    workspace
                  </div>
                  <div className="flex w-full flex-row items-center justify-start  gap-3">
                    <button
                      disabled={
                        invitation?.invitation_id == isManagingThisInvitation
                      }
                      className={`text-xs ${
                        invitation?.invitation_id == isManagingThisInvitation
                          ? "bg-black/50"
                          : "bg-black"
                      } py-1 m-0 text-white rounded-sm px-2`}
                      onClick={() => {
                        setisManagingThisInvitation(invitation?.invitation_id);
                        handleAcceptInvitation(invitation);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      disabled={
                        invitation?.invitation_id == isManagingThisInvitation
                      }
                      className="text-xs  bg-white text-black border py-1 m-0 rounded-sm px-2"
                      onClick={() => {
                        handleDeclineInvitation(invitation);
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Dialog
        open={creatFormOpen}
        onOpenChange={(e) => {
          setcreateFormOpen(e);
        }}
      >
        <DialogContent className="h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-0">
          <DialogHeader className="h-fit m-0">
            <p className="font-semibold">Select a workspace</p>
          </DialogHeader>
          <div className="w-full h-full m-0 mt-5 space-y-1 mb-2">
            {workspaces?.map((workspace: any) => (
              <p
                onClick={() => {
                  setcreateFormOpen(false);
                  router.push(
                    `https://form-x-eight.vercel.app/workspaces/${workspace?.workspace_id}?create_form=true`
                  );
                }}
                className="hover:bg-gray-50 hover:shadow-lg border shadow-sm cursor-pointer text-sm rounded-md px-3 w-full py-1"
              >
                {workspace?.name}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={creatWorkspaceOpen}
        onOpenChange={(e) => {
          setcreatWorkspaceOpen(e);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Workspace</DialogTitle>
            <DialogDescription>
              Create a workspace in this organization
            </DialogDescription>
          </DialogHeader>
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
                setcreatWorkspaceOpen(false);
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopNavbar;
