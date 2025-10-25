import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { user_id, workspace_id, email }: any = await req.json();

  try {
    const form = await prisma.collaborators.deleteMany({
      where: {
        user_id: user_id,
        workspace_id: workspace_id,
      },
    });

    const removedInvitation = await prisma.organization_invitations.deleteMany({
      where: {
        email: email,
        workspace_id: workspace_id,
      },
    });

    return NextResponse.json({ form, removedInvitation }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
