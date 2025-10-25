"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MembersModal = ({
  currentWorkspace,
  currenOrganization,
  session,
  removeFromWorkspace,
  close,
}: any) => {
  const [invitations, setInvitations] = useState(null);
  const [collaborators, setCollaborators] = useState(null);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [roleChanges, setRoleChanges]: any = useState({});

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
          <div className="w-1/2">
            <Button
              className="w-full"
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
              onClick={() =>
                removeFromWorkspace(
                  row?.original?.users?.user_id,
                  row?.original?.users?.email
                )
              }
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
  };

  const fetchOrganisationMembers = async () => {
    setLoadingCollaborators(true);
    const response = await fetch(
      "https://form-x-eight.vercel.app/api/fetchOrganisationMembers",
      {
        method: "POST",
        body: JSON.stringify({
          organisation_id: currenOrganization?.organization_id,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      setCollaborators(data?.collaborators);
    }
    setLoadingCollaborators(false);
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

  useEffect(() => {
    fetchInvitations();
    fetchOrganisationMembers();
    fetchWorkspaceMembers();
  }, []);

  return (
    <div className="w-full h-full px-10 mt-5">
      <Breadcrumb className="pb-10 text-gray-400">
        <BreadcrumbList>
          <BreadcrumbItem onClick={close}>
            <BreadcrumbPage className="cursor-pointer text-gray-600 font-semibold ">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-gray-400">
              Members
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="organisation" className="w-full">
        <TabsList>
          <TabsTrigger value="organisation">Organisation Members</TabsTrigger>
          <TabsTrigger value="members">Workspace Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        <TabsContent value="organisation">
          <div className="m-10 w-full ">
            {loadingCollaborators ? (
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
          <div className="m-10 w-full ">
            {loadingMembers ? (
              <Loader2 className="animate-spin mx-auto mt-48" /> // Show spinner while loading
            ) : (
              <DataTable
                columns={columns}
                data={
                  currenOrganization
                    ? currenOrganization?.workspaces?.find(
                        (workspace: any) =>
                          workspace?.workspace_id ==
                          currentWorkspace?.workspace_id
                      )?.collaborators
                    : []
                }
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="invitations">
          <div className="m-10 w-full ">
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
