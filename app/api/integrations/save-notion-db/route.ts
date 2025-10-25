// pages/api/form.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { name, database, form_id, database_mappings, database_properties } =
    await req.json();
  console.log(database_mappings);
  try {
    // Fetch form data including form_json
    const form: any = await prisma.forms.findFirst({
      where: {
        form_id: form_id,
      },
    });

    if (!form) {
      return NextResponse.json({ message: "form not found" }, { status: 404 });
    }
    const updatedform = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        integrations: {
          ...(form?.integrations ? form?.integrations : {}),
          notion: {
            ...form.integrations.notion,
            name: name,
            database_id: database,
            database_mappings: database_mappings,
            database_properties: database_properties,
          },
        },
      },
    });
    return NextResponse.json({ form: updatedform }, { status: 200 });

    // console.log("Updated form:", updatedform);
  } catch (error) {
    console.error("Error creating sheet or updating form:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
