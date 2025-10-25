import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { workspace_id }: any = await req.json();

  try {
    let form = await prisma.workspaces.update({
      where: {
        workspace_id: workspace_id,
      },
      data: {
        // api_key: randomUUID(),
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
