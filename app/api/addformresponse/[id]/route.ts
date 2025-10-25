import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: Params) {
  const form_id = params.id;
  const url = new URL(req.url);
  const api_key = url.searchParams.get("api_key");

  try {
    const requestBody: any = await req.json();

    // Check if the form exists and if the API key is valid
    const form = await prisma.forms.findUnique({
      where: { form_id },
    });

    if (form && !form?.api_enabled) {
      return NextResponse.json(
        { message: "Workspace API not enabled" },
        { status: 404 }
      );
    }

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    if (form?.api_key !== api_key) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 403 });
    }

    // Create new form response
    const newResponse = await prisma.form_responses.create({
      data: {
        form_id,
        responses: requestBody,
      },
    });

    const formInc = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        api_submitted_count: {
          increment: 1,
        },
      },
    });
    console.log(formInc);

    return NextResponse.json({ response: newResponse }, { status: 200 });
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
