import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { workspace_id, user_id } = await req.json();

  try {
    // Fetch invitations received by the current user
    const invitations = await prisma.organization_invitations.findMany({
      where: {
        workspace_id: workspace_id,
        invitation_status: "pending",
        invited_by: user_id,
      },
      include: {
        users: {
          select: {
            email: true,
          },
        },
        organizations: {
          select: {
            name: true,
          },
        },
        workspaces: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    // Fetch invitations received by the current user
    const invitations = await prisma.organization_invitations.delete({
      where: {
        invitation_id: id,
      },
    });

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error deleting invitations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { invitationId, newRole } = await req.json();

  try {
    // Fetch invitations received by the current user
    const invitations = await prisma.organization_invitations.update({
      where: {
        invitation_id: invitationId,
      },
      data: {
        role: newRole,
      },
    });

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error updating invitations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
