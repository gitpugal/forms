import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, org_id, description, user_id }: any = await req.json();

  try {
    let workspace = await prisma.workspaces.create({
      data: {
        name: name,
        description: description,
        organization_id: org_id,
      },
    });

    let collaborator = await prisma.collaborators.create({
      data: {
        user_id: user_id,
        workspace_id: workspace.workspace_id,
        role: "admin",
      },
    });

    return NextResponse.json({ workspace, collaborator }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
