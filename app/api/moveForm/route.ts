import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: Params) {
  const { workspace_id, form_id } = await req.json();

  try {
    // Check if the form exists and if the API key is valid
    const workspace = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        workspace_id: workspace_id,
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
          target == "workspace_id" || target == "title"
            ? "Form with same name already exists in the target workspace"
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
