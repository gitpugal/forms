import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { status, workspace_id }: any = await req.json();

  try {
    let form = await prisma.workspaces.update({
      where: {
        workspace_id: workspace_id,
      },
      data: {
        // api_enabled: status,
      },
    });

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
