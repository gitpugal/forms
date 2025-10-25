import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { invitation, decision } = await req.json();

  try {
    // Update invitation status based on the decision
    await prisma.organization_invitations.update({
      where: {
        invitation_id: invitation?.invitation_id,
      },
      data: {
        invitation_status: decision === "accept" ? "accepted" : "declined",
      },
    });

    // If the decision is to accept the invitation
    if (decision === "accept") {
      // Fetch user_id based on email
      const invitedUser = await prisma.users.findUnique({
        where: {
          email: invitation.email,
        },
        select: {
          user_id: true,
        },
      });

      // If the invited user exists, add them to the new organization
      if (invitedUser) {
        const existingUserOrganization =
          await prisma.userOrganization.findFirst({
            where: {
              user_id: invitedUser.user_id,
              organization_id: invitation.organization_id,
            },
          });
        if (!existingUserOrganization) {
          // Add the user to the organization
          await prisma.userOrganization.create({
            data: {
              user_id: invitedUser.user_id,
              organization_id: invitation.organization_id,
            },
          });
        }

        // Check for existing collaborator entry with the same role for this user and workspace
        const existingCollaborator = await prisma.collaborators.findFirst({
          where: {
            user_id: invitedUser.user_id,
            workspace_id: invitation.workspace_id,
          },
        });

        // If such an entry exists, delete it
        if (existingCollaborator) {
          await prisma.collaborators.delete({
            where: {
              collaborator_id: existingCollaborator.collaborator_id,
            },
          });
        }

        // Add the user as a collaborator with the new role
        await prisma.collaborators.create({
          data: {
            role: invitation.role,
            workspace_id: invitation.workspace_id,
            user_id: invitedUser.user_id,
          },
        });

        // Send a response indicating successful acceptance
        return NextResponse.json(
          { message: "Invitation accepted successfully" },
          { status: 200 }
        );
      } else {
        // If the invited user doesn't exist, return an error response
        return NextResponse.json(
          { message: "Invited user not found" },
          { status: 404 }
        );
      }
    } else {
      // Send a response indicating successful declining
      return NextResponse.json(
        { message: "Invitation declined successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating invitation status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
