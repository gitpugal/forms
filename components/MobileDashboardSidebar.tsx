"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CreatModal } from "./modals/project-create-modal";
import { Skeleton } from "./ui/skeleton";
import {
  Ellipsis,
  HomeIcon,
  LayoutTemplate,
  Plus,
  Settings,
  TrashIcon,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { signOut, useSession } from "next-auth/react";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";
import { Organizationswitcher } from "./OrganizationSwitcher";

import { useToast } from "./ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HTML5Backend } from "react-dnd-html5-backend";

import organizationService from "@/app/services/organization";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDrag, useDrop, DndProvider } from "react-dnd";

const MobileDashboardSidebar = () => {
  const searchParams = useSearchParams();
  const createForm = searchParams?.get("create_form");
  const organizationservice: any = new organizationService();
  const path = usePathname();
  const { data: session, status }: any = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showContent, setShowContent] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currentOrganization, setcurrentOrganization]: any = useState(null);
  const [workspaces, setWorkSpaces]: any = useState(null);
  const [organizations, setOrganizations]: any = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isFetchingInvitations, setisFetchingInvitations] = useState(false);
  const [forms, setForms]: any = useState(null);
  const { toast } = useToast();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const router = useRouter();
  const [isTrashDialogOpen, setisTrashDialogOpen] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);
  const [deleteDialogopen, setdeleteDialogopen] = useState(false);
  const [logoutOpen, setlogoutOpen] = useState(false);
  const [CreatForm, setCreatForm] = useState(false);

  const fetchData = async () => {
    try {
      setFetching(true);
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
        if (curorg != undefined && curorg) {
          setcurrentOrganization(curorg);
          setWorkSpaces(curorg?.workspaces);
        } else {
          setcurrentOrganization(data?.organizations[0]);
          localStorage?.setItem(
            "formflowcurrenorganisation",
            data?.organizations[0]?.organization_id
          );
          const event: any = new Event("storage");
          event.key = "formflowcurrenorganisation";
          event.newValue = data?.organizations[0]?.organization_id;
          window.dispatchEvent(event);
          setWorkSpaces(data?.organizations[0].workspaces);
        }
      } else {
        setcurrentOrganization(data?.organizations[0]);
        localStorage?.setItem(
          "formflowcurrenorganisation",
          data?.organizations[0]?.organization_id
        );
        const event: any = new Event("storage");
        event.key = "formflowcurrenorganisation";
        event.newValue = data?.organizations[0]?.organization_id;
        window.dispatchEvent(event);
        setWorkSpaces(data?.organizations[0].workspaces);
      }
      setOrganizations(data?.organizations);
      setFetching(false);
      console.log(data);
      setCreatForm(createForm ? true : false);
    } catch (error) {
      setFetching(false);
    }
  };
  useEffect(() => {
    let timeoutId: any;

    if (isSidebarOpen) {
      timeoutId = setTimeout(() => setShowContent(true), 500);
    } else {
      setShowContent(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirmation(false);
    signOut();
  };

  useEffect(() => {
    // Fetch invitations received for the current user
    const fetchInvitations = async () => {
      setisFetchingInvitations(true);
      try {
        const response = await fetch(
          `/api/received-invitations?email=${session?.user?.email}`
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

    if (status === "authenticated" && session?.user?.user_id && !workspaces) {
      fetchData();
    }

    if (session?.user && !invitations && !isFetchingInvitations) {
      fetchInvitations();
    }

    const fetchdatacookie = localStorage?.getItem("fetchdata");
    if (status === "authenticated" && fetchdatacookie === "true") {
      localStorage?.setItem("fetchdata", "false");
      fetchData();
    }

    const handleStorageChange = (event: any) => {
      if (event.key === "fetchdata" && event.newValue === "true") {
        if (status === "authenticated" && session?.user?.user_id) {
          localStorage?.setItem("fetchdata", "false");
          fetchData();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [session, status]);

  // Debounce function
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | undefined;
    return function (...args: Parameters<T>) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => func(...args), delay);
    };
  }

  // Debounced API call
  const debouncedUpdateFormOrderInBackend = debounce(
    async (updatedForms: any) => {
      try {
        // alert("Order updated");
        const response = await fetch(
          "https://form-x-eight.vercel.app/api/update-form-order",
          {
            method: "PUT",
            body: JSON.stringify({ updatedForms }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update form order");
        }

        const data = await response.json();
        console.log("Form order updated successfully:", data);
      } catch (error) {
        console.error("Error updating form order:", error);
      }
    },
    3000
  ); // 3 seconds debounce delay

  // Move form function
  const moveForm = (dragIndex: any, hoverIndex: any, workspaceIndex: any) => {
    const updatedWorkspaces = [...workspaces];
    const workspace = updatedWorkspaces[workspaceIndex];
    const updatedForms = [...workspace.forms];
    const [movedForm] = updatedForms.splice(dragIndex, 1);
    updatedForms.splice(hoverIndex, 0, movedForm);
    updatedForms.forEach((form, index) => {
      form.order = index + 1; // Update the order field
    });
    workspace.forms = updatedForms;
    setWorkSpaces(updatedWorkspaces);
    return updatedForms; // Return the updated forms
  };

  // Handle drop function
  const handleDrop = useCallback(
    (dragIndex: any, hoverIndex: any, workspaceIndex: any) => {
      const updatedForms = moveForm(dragIndex, hoverIndex, workspaceIndex);
      // Trigger the debounced function to update the order
      debouncedUpdateFormOrderInBackend(updatedForms);
    },
    [workspaces]
  );

  const FormItem = ({ form, index, workspaceIndex, moveForm }: any) => {
    const ref = React.useRef<any>(null);

    const [, drop] = useDrop({
      accept: "FORM",
      hover(item: any, monitor: any) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset: any = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        moveForm(dragIndex, hoverIndex, workspaceIndex);
        item.index = hoverIndex;
      },
      drop(item: any) {
        handleDrop(item.index, index, workspaceIndex);
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: "FORM",
      item: { type: "FORM", index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    return (
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <p
          key={form?.title}
          onClick={() => {
            console.log(form);
            localStorage?.setItem("formflowsettingstab", "settings");
            router.push(
              `https://form-x-eight.vercel.app/form/${form?.form_id}${
                !form?.published ? "/edit" : ""
              }`
            );
          }}
          className={`py-1 px-1 hover:bg-gray-50 ${
            path.split("/")[1] == "form" &&
            path.split("/")[2] == form?.form_id &&
            "bg-gray-100 rounded-md pl-2"
          } hover:underline`}
        >
          {form?.title}
        </p>
      </div>
    );
  };

  const openProModal = () => {
    localStorage?.setItem("formflowpromodal", "true");
    const event: any = new Event("storage");
    event.key = "formflowpromodal";
    event.newValue = "true";
    window.dispatchEvent(event);
  };
  return (
    <div
      className={` flex relative flex-col w-full h-full overflow-y-scroll no-scrollbar items-start justify-between gap-5 `}
    >
      <DndProvider backend={HTML5Backend}>
        <div
          className={`${
            showContent
              ? "opacity-100 duration-200"
              : "opacity-0 duration-0 -z-10"
          } flex flex-col h-full p-3 pt-7 m-0  overflow-y-auto apple-scrollbar items-start justify-between gap-5 w-full `}
        >
          <div className="transition-opacity ease-in-out flex items-center justify-between gap-3 w-full">
            {organizations ? (
              <Organizationswitcher
                organizations={organizations}
                changeOrganization={(org_id: string) => {
                  localStorage?.setItem("formflowcurrenorganisation", org_id);
                  const event: any = new Event("storage");
                  event.key = "formflowcurrenorganisation";
                  event.newValue = org_id;
                  window.dispatchEvent(event);
                  fetchData();
                }}
                defaultorgId={currentOrganization?.organization_id}
              />
            ) : (
              <div
                className={cn(
                  "flex focus:ring-white  w-fit border-none p-0 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
                )}
              >
                <div className="text-[#888888] py-2 font-semibold focus:outline-none flex items-center justify-start gap-1">
                  <span className="bg-[#d0d0d0] rounded-full text-white h-9 w-9 flex py-2 font-semibold cursor-pointer items-center justify-center text-sm">
                    {session?.user?.first_name?.slice(0, 1)}
                  </span>
                  <p className="text-sm text-[#616161] pl-2 w-auto">
                    {session?.user?.first_name}
                  </p>
                </div>
              </div>
            )}
            <DropdownMenu
              open={logoutOpen}
              onOpenChange={(e) => {
                setlogoutOpen(e);
              }}
            >
              <DropdownMenuTrigger className="cursor-pointer focus:right-0 focus:outline-none">
                <Ellipsis className="text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={"/settings/profile"}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 w-full border-t-2 border-[#f5f5f5] pt-6 flex flex-col gap-5 items-start justify-start">
            <div className="flex flex-col gap-1 items-start justify-start w-full">
              <div
                onClick={() => {
                  router.push(`/dashboard`);
                }}
                className={`p-1 pl-1 pt-2 text-[#0f0f0f] mb-5 relative text-left rounded-sm cursor-pointer hover:bg-[#f3f3f3] text-sm w-full text-clip `}
              >
                <HomeIcon
                  size={20}
                  className="inline text-[#5f5f5f] pb-1 mr-5 text-[14px]"
                />
                Home
              </div>
              <div className="flex flex-row text-[#0f0f0f]  ml-1 items-center justify-between w-full">
                <p className="text-sm ">workspace</p>
                <Plus
                  onClick={(e) => {
                    if (!session?.user?.pro) {
                      openProModal();
                    } else if (
                      session &&
                      (session.user.onboarded == "false" ||
                        session.user.onboarded == false)
                    ) {
                      e.preventDefault();
                      // expandSidebar();
                    } else {
                      setIsOpen((prev) => !prev);
                    }
                  }}
                  size={18}
                  className="cursor-pointer mt-1 text-[#4e4e4e] hover:bg-gray-200  rounded-sm hover:scale-90 transition-transform duration-100 ease-in"
                />
              </div>

              <Accordion type="single" className="w-full" collapsible>
                {workspaces && !fetching ? (
                  workspaces.length > 0 &&
                  workspaces.map((workspace: any, index: number) => (
                    <AccordionItem
                      value={`item-${index}`}
                      key={`item-${index}`}
                      className="border-none h-fit m-0 pl-1 rounded-sm cursor-pointer text-sm w-full text-clip text-[#888888] font-light"
                    >
                      <div className=" flex flex-row group rounded-sm gap-1 px-2 py-1 hover:bg-gray-100 w-full items-center justify-start">
                        <AccordionTrigger className="p-1  hover:bg-gray-300 rounded-sm"></AccordionTrigger>
                        <p
                          onClick={() => {
                            router.push(
                              `/workspaces/${workspace?.workspace_id}`
                            );
                            // changeWorkspace(workspace);
                          }}
                          className="flex-1 p-1 "
                        >
                          {workspace.name}
                        </p>
                      </div>
                      <AccordionContent className="pl-3 ">
                        <div className="workspace-list">
                          {workspace.forms.map((form: any, formindex: any) => (
                            <FormItem
                              key={form.form_id}
                              index={formindex}
                              workspaceIndex={index}
                              form={form}
                              moveForm={moveForm}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <>
                    <div className="flex flex-row mt-3 pl-3 justify-between items-stretch gap-2">
                      <Skeleton className="bg-[#d0d0d0] rounded-md text-transparent h-5 w-5  flex p-0 font-semibold cursor-pointer items-center justify-center text-sm">
                        p
                      </Skeleton>
                      <Skeleton className="bg-[#d0d0d0] flex-1 text-sm text-transparent font-semibold">
                        p
                      </Skeleton>
                    </div>{" "}
                    <div className="flex flex-row mt-3 pl-3 justify-between items-stretch gap-2">
                      <Skeleton className="bg-[#d0d0d0] rounded-md text-transparent h-5 w-5  flex p-0 font-semibold cursor-pointer items-center justify-center text-sm">
                        p
                      </Skeleton>
                      <Skeleton className="bg-[#d0d0d0] flex-1 text-sm text-transparent font-semibold">
                        p
                      </Skeleton>
                    </div>
                  </>
                )}
              </Accordion>
            </div>
            <div className="flex flex-col gap-3 pt-5 items-start justify-start border-t-2 border-[#f5f5f5] w-full">
              <div
                onClick={() => {
                  router.push(`/members`);
                }}
                className={`p-1 pl-1 pt-2 relative text-left rounded-sm cursor-pointer hover:bg-[#f3f3f3] text-sm w-full text-clip`}
              >
                <Users
                  size={20}
                  className="inline pb-1 mr-6 text-[#5f5f5f]  text-[14px]"
                />
                Members
              </div>
              <div
                onClick={() => {
                  router.push(`/settings/profile`);
                }}
                className={`p-1 pl-1 pt-2 relative text-left rounded-sm cursor-pointer hover:bg-[#f3f3f3] text-sm w-full text-clip`}
              >
                <Settings
                  size={20}
                  className="inline pb-1 mr-6 text-[#5f5f5f]  text-[14px]"
                />
                Settings
              </div>
              {/* <Accordion type="single" className="w-full" collapsible>
                <AccordionItem
                  value={`item-settings`}
                  key={`item-settings`}
                  className="border-none m-0 h-fit rounded-sm cursor-pointer text-sm w-full text-clip text-[#888888] font-light"
                >
                  <AccordionTrigger className="p-1 pl-1 text-left rounded-sm cursor-pointer text-sm w-full text-clip text-[#616161] font-semibold">
                    <div>
                      <Settings className="inline pb-1 mr-4 text-[14px]" />
                      Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 py-2 bg-gray-100 rounded-sm w-full">
                    <div className=" flex flex-col gap-2 ">
                      {workspaces?.map((form: any, formindex: any) => (
                        <Link
                          className="hover:bg-white rounded-sm px-2 py-1"
                          href={`https://form-x-eight.vercel.app/workspaces/${form?.workspace_id}/settings`}
                        >
                          {form?.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion> */}
              <div
                onClick={() => {
                  router.push(`/templates`);
                }}
                className={`p-1 pl-[5px] pt-2 relative text-left rounded-sm cursor-pointer hover:bg-[#f3f3f3] text-sm w-full text-clip`}
              >
                <LayoutTemplate
                  size={19}
                  className="inline pb-1 mr-5 text-[#5f5f5f]  text-[14px]"
                />
                Templates
              </div>
              <div
                onClick={() => {
                  router.push(`/trash`);
                }}
                className={`p-1 pl-1 pt-2 relative text-left rounded-sm cursor-pointer hover:bg-[#f3f3f3] text-sm w-full text-clip`}
              >
                <TrashIcon
                  size={20}
                  className="inline pb-1 mr-6 text-[#5f5f5f]  text-[14px]"
                />
                Trash
              </div>
            </div>
          </div>
        </div>
      </DndProvider>

      <CreatModal
        org_id={currentOrganization?.organization_id}
        user_id={session?.user?.user_id}
        isOpen={isOpen}
        onClose={() => setIsOpen((prev) => !prev)}
        onConfirm={(data: any) => {
          setWorkSpaces((prev: any) => [...prev, data?.workspace]);
        }}
      />
      <LogoutConfirmationDialog
        isOpen={showLogoutConfirmation}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default MobileDashboardSidebar;
