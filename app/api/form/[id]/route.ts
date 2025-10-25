import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: Params) {
  const form_id = params.id;
  console.log("formid: ", form_id);
  try {
    // Check if the form exists and if the API key is valid
    const form = await prisma.forms.findFirst({
      where: { form_id },
      include: {
        workspaces: {
          include: {
            collaborators: true,
          },
        },
      },
    });
    console.log(form);
    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
