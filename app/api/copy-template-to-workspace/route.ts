import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { form_id, workspace_id }: any = await req.json();
  const new_form_id = randomUUID();
  if (!form_id) {
    return NextResponse.json(
      { message: "Form ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the existing form by form_id
    const existingForm = await prisma.forms.findUnique({
      where: {
        form_id: form_id,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    // Create a new form with the fetched data but a new form_id
    const duplicatedForm = await prisma.forms.create({
      data: {
        form_id: new_form_id,
        title: existingForm?.title,
        description: existingForm?.description,
        workspace_id: workspace_id,
        published: false,
        form_json: existingForm?.form_json as any[],
        bannerUrl: existingForm?.bannerUrl,
        logoUrl: existingForm?.logoUrl,
      },
    });

    return NextResponse.json({ form: duplicatedForm }, { status: 200 });
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
