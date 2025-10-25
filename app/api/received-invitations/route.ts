import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  const org_id = url.searchParams.get("org_id") || "";

  try {
    // Fetch invitations received by the current user
    const invitations = await prisma.organization_invitations.findMany({
      where: {
        email: email,
        invitation_status: "pending",
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

    const forms = await prisma.forms.findMany({
      where: {
        workspaces: {
          organization_id: org_id,
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    const workspaces = await prisma.workspaces.findMany({
      where: {
        organization_id: org_id,
      },
    });

    return NextResponse.json(
      { invitations, forms, workspaces },
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
