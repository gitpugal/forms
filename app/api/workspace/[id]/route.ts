import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: Params) {
  const workspace_id = params.id;

  try {
    // Check if the form exists and if the API key is valid
    const workspace = await prisma.workspaces.findUnique({
      where: { workspace_id },
      include: {
        forms: {
          where: {
            trash: false,
          },
          orderBy: [
            {
              updated_at: "desc",
            },
            {
              created_at: "desc",
            },
          ],
        },
        collaborators: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Fetch invitations received by the current user
    const organization = await prisma.organizations.findFirst({
      where: {
        workspaces: {
          some: {
            workspace_id: workspace_id,
          },
        },
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
          organization_id: organization?.organization_id,
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
      { workspace, collaborators: uniqueCollaborators, organization },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
