import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("/api/workspace - GET ");
  const url = new URL(req.url);
  const org_id = url.searchParams.get("org_id");
  console.log(org_id);
  if (!org_id) {
    return NextResponse.json(
      { message: "Organization ID is required" },
      { status: 400 }
    );
  }

  try {
    const workspaces = await prisma.workspaces.findMany({
      where: {
        organization_id: org_id,
      },
      include: {
        collaborators: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_image: true,
              },
            },
          },
        },
        forms: true,
      },
    });
    console.log(workspaces);

    // Fetch invitations received by the current user
    const organization = await prisma.organizations.findFirst({
      where: {
        organization_id: org_id,
      },
      include: {
        admin: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const adminUserId = organization.admin_id;

    // Step 2: Fetch all collaborators
    const collaborators = await prisma.collaborators.findMany({
      where: {
        workspaces: {
          organization_id: org_id,
        },
      },
      include: {
        users: true,
        workspaces: true,
      },
    });

    // Step 3: Use a map to filter out duplicate user_id and update the role of the admin
    const uniqueCollaboratorsMap = new Map();
    for (const collaborator of collaborators) {
      if (collaborator.user_id == adminUserId) {
        // Update the admin's role to "organization admin"
        collaborator.role = "orgadmin"; // Assuming "organization admin" corresponds to the "admin" role in the Role enum
      }
      uniqueCollaboratorsMap.set(collaborator.user_id, collaborator);
    }

    // Convert the map values back to an array
    const uniqueCollaborators = Array.from(uniqueCollaboratorsMap.values());

    return NextResponse.json(
      { workspaces, collaborators: uniqueCollaborators },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, org_id, description, user_id }: any = await req.json();

  try {
    let newworkspace = await prisma.workspaces.create({
      data: {
        name: name,
        description: description,
        organization_id: org_id,
      },
    });

    let collaborator = await prisma.collaborators.create({
      data: {
        user_id: user_id,
        workspace_id: newworkspace.workspace_id,
        role: "admin",
      },
    });

    const workspace = await prisma.workspaces.findFirst({
      where: {
        workspace_id: newworkspace?.workspace_id,
      },
      include: {
        forms: true,
        collaborators: true,
      },
    });

    return NextResponse.json({ workspace, collaborator }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        const message =
          target === "name"
            ? "Workspace name already exists"
            : "Unique constraint violation";
        return NextResponse.json({ message: message }, { status: 400 });
      }
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
