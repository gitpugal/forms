import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { organisation_id } = await req.json();

  try {
    // Fetch invitations received by the current user
    const organization = await prisma.organizations.findUnique({
      where: {
        organization_id: organisation_id,
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
          organization_id: organisation_id,
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
      { collaborators: uniqueCollaborators },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
