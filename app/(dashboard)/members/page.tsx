"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const page = () => {
  const router = useRouter();
  const session: any = useSession();
  const [invitations, setInvitations] = useState(null);
  const [collaborators, setCollaborators] = useState(null);
  const [workspaces, setWorkSpaces]: any[] = useState(null);
  const searchParams = useSearchParams();
  const curWorkspaceId = searchParams.get("workspace_id");
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [currentWorkspace, setcurrentWorkspace]: any = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [roleChanges, setRoleChanges]: any = useState({});
  const [fetching, setFetching] = useState(false);

  const handleRoleChange = (invitationId: any, newRole: any) => {
    console.log(invitationId, newRole);
    setRoleChanges((prev: any) => ({ ...prev, [invitationId]: newRole }));
  };

  const resendInvitation = async (invitationId: any) => {
    const newRole = roleChanges[invitationId];
    if (!newRole) return;

    const response = await fetch(
      "https://form-x-eight.vercel.app/api/fetchUserSentInvitations",
      {
        method: "PUT",
        body: JSON.stringify({
          invitationId,
          newRole,
        }),
      }
    );

    if (response.ok) {
      // Update invitations state if needed
      fetchInvitations();
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: `users.first_name`,
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="w-full md:w-1/2">
            <Button
              className="w-full text-xs"
              disabled={
                (!currentWorkspace?.collaborators?.find(
                  (collab: any) =>
                    collab?.users?.email == session?.data?.user?.email &&
                    collab?.role == "admin"
                ) &&
                  row?.original?.users?.email != session?.data?.user?.email) ||
                (currentWorkspace?.collaborators?.find(
                  (collab: any) =>
                    collab?.users?.email == session?.data?.user?.email &&
                    collab?.role == "admin"
                ) &&
                  row?.original?.users?.email == session?.data?.user?.email)
              }
              variant={"destructive"}
              //   onClick={() =>
              //     removeFromWorkspace(
              //       row?.original?.users?.user_id,
              //       row?.original?.users?.email
              //     )
              //   }
            >
              {row?.original?.users?.email == session?.data?.user?.email
                ? "Leave from workspace"
                : "Remove from workspace"}
            </Button>
          </div>
        );
      },
    },
  ];

  const orgColumns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: `users.first_name`,
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("role") == "orgadmin"
            ? "Organization Admin"
            : row.getValue("role")}
        </div>
      ),
    },
  ];

  const InvitationColumns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: `email`,
      header: "Email",
    },
    {
      accessorKey: `created_at`,
      header: "Invited at",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="capitalize mr-2">{row.getValue("role")}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Edit role",
      cell: ({ row }) => (
        <Select
          // defaultValue={row.getValue("role")}
          onValueChange={(value: any) =>
            handleRoleChange(row.original.invitation_id, value)
          }
          value={
            roleChanges[row.original.invitation_id] || row.getValue("role")
          }
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Edit role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="w-1/2 flex">
            <Button
              onClick={() => {
                deleteInvitation(row.original.invitation_id);
              }}
              variant={"destructive"}
              className="mr-2"
            >
              Delete invitation
            </Button>
            <Button
              onClick={() => {
                resendInvitation(row.original.invitation_id);
              }}
              disabled={
                !roleChanges[row.original.invitation_id] ||
                row.getValue("role") == roleChanges[row.original.invitation_id]
              }
              variant={"default"}
            >
              Resend Invitation
            </Button>
          </div>
        );
      },
    },
  ];

  const fetchInvitations = async () => {
    if (currentWorkspace?.workspace_id) {
      setLoadingInvitations(true);
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/fetchUserSentInvitations",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: session?.data?.user?.id,
            workspace_id: currentWorkspace?.workspace_id,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInvitations(data?.invitations);
      }
      setLoadingInvitations(false);
    }
  };

  const fetchWorkspaceMembers = async () => {
    setLoadingMembers(true);
    // Add your logic to fetch workspace members here
    setLoadingMembers(false);
  };

  const deleteInvitation = async (id: string) => {
    const response = await fetch(
      "https://form-x-eight.vercel.app/api/fetchUserSentInvitations",
      {
        method: "DELETE",
        body: JSON.stringify({
          id: id,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      setInvitations((prev: any) =>
        prev.filter((it: any) => it.invitation_id != id)
      );
    }
  };
  const fetchData = async () => {
    try {
      const curorgid = localStorage?.getItem("formflowcurrenorganisation");
      setFetching(true);
      const response = await fetch(
        `https://form-x-eight.vercel.app/api/workspace?org_id=${curorgid}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setWorkSpaces(data?.workspaces);
        setcurrentWorkspace(
          curWorkspaceId
            ? data?.workspaces?.find(
                (workspace: any) => workspace?.workspace_id == curWorkspaceId
              )
            : data?.workspaces[0]
        );
        // setcurrenOrganization(data?.organization);
        setCollaborators(data?.collaborators);
        setFetching(false);
        fetchInvitations();
      } else {
        setFetching(false);
      }
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.workspace_id) {
      fetchInvitations();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (!fetching) {
      fetchData();
    }
    const handleStorageChange = (event: any) => {
      if (event.key == "formflowcurrenorganisation") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="w-full h-full px-3 md:px-10 pt-7">
      <Tabs defaultValue="organisation" className=" w-full overflow-x-hidden">
        <TabsList className="w-full md:w-fit ">
          <TabsTrigger className="md:text-sm text-[10px]" value="organisation">
            Organisation Members
          </TabsTrigger>
          <TabsTrigger className="md:text-sm text-[10px]" value="members">
            Workspace Members
          </TabsTrigger>
          <TabsTrigger className="md:text-sm text-[10px]" value="invitations">
            Invitations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="organisation">
          <div className="my-10 w-full ">
            {loadingCollaborators || fetching ? (
              <Loader2 className="animate-spin mx-auto mt-48" /> // Show spinner while loading
            ) : (
              <DataTable
                columns={orgColumns}
                data={collaborators ? collaborators : []}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="members">
          <div className="my-10 w-full ">
            <p className="mb-2 font-semibold opacity-80">Workspace</p>
            <Select
              value={currentWorkspace?.workspace_id}
              onValueChange={(workspace_id) => {
                setcurrentWorkspace(
                  workspaces?.find(
                    (workspace: any) => workspace?.workspace_id == workspace_id
                  )
                );
              }}
            >
              <SelectTrigger className="mb-5 md:w-1/2 w-3/4 focus:outline-none focus:ring-offset-0 focus:ring-0">
                <SelectValue placeholder="Select an workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Workspace</SelectLabel>
                  {workspaces?.map((workspace: any) => (
                    <SelectItem value={workspace?.workspace_id}>
                      {workspace?.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {loadingMembers || fetching ? (
              <Loader2 className="animate-spin mx-auto mt-48" /> // Show spinner while loading
            ) : (
              <DataTable
                columns={columns}
                data={currentWorkspace ? currentWorkspace?.collaborators : []}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="invitations">
          <div className="my-10 w-full">
            {loadingInvitations ? (
              <Loader2 className="animate-spin mx-auto mt-48" /> // Show spinner while loading
            ) : (
              <DataTable
                columns={InvitationColumns}
                data={invitations ? invitations : []}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
