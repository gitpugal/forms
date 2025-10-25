import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    email,
    role,
    organizationId,
    workspace_id,
    invitedBy,
  }: {
    email: string;
    role: any;
    organizationId: string;
    workspace_id: string;
    invitedBy: string;
  } = await req.json();

  try {
    // Check if the user with the given email exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    console.log(existingUser);
    if (!existingUser) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    // Check if an invitation has already been sent for the specific workspace
    const existingInvitation = await prisma.organization_invitations.findFirst({
      where: {
        email,
        organization_id: organizationId,
        workspace_id: workspace_id,
        invitation_status: {
          in: ["pending", "accepted"],
        },
        role: role,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          message:
            "An invitation has already been sent to this email for this workspace for the same role.",
        },
        { status: 400 }
      );
    }

    await prisma.organization_invitations.deleteMany({
      where: {
        email: email,
        organization_id: organizationId,
        workspace_id: workspace_id,
      },
    });

    // Create the organization invitation
    await prisma.organization_invitations.create({
      data: {
        email: email,
        role: role,
        organization_id: organizationId,
        workspace_id: workspace_id,
        invited_by: invitedBy,
        invitation_status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Invitation sent successfully" },
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
