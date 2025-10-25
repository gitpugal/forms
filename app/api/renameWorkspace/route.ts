import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: Params) {
  const { title, workspace_id } = await req.json();

  try {
    // Check if the form exists and if the API key is valid
    const workspace = await prisma.workspaces.update({
      where: {
        workspace_id: workspace_id,
      },
      data: {
        name: title,
      },
    });

    return NextResponse.json({ workspace }, { status: 200 });
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        console.log(
          "---------------------------------------------------------------------------------------"
        );
        console.log(target);
        const message =
          target == "organization_id"
            ? "workspace name already exists"
            : "Unique constraint  violation";
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
