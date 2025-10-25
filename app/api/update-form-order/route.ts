import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { updatedForms }: any = await req.json();

  if (!Array.isArray(updatedForms)) {
    return NextResponse.json(
      { message: "Invalid data format" },
      { status: 400 }
    );
  }

  try {
    const cases = updatedForms
      .map((form: any) => `WHEN form_id = '${form.form_id}' THEN ${form.order}`)
      .join(" ");

    const formIds = updatedForms
      .map((form: any) => `'${form.form_id}'`)
      .join(", ");

    const query: any = `
      UPDATE forms
      SET formorder = CASE
        ${cases}
      END
      WHERE form_id IN (${formIds});
    `;

    console.log(query)

    await prisma.$executeRawUnsafe(query);

    return NextResponse.json(
      { message: "Forms order updated successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        const message =
          target === "title"
            ? "Cannot update settings"
            : "Unique constraint violation";
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
