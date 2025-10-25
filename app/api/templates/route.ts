import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("/api/templates- GET ");
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  const org_id = url.searchParams.get("org_id");

  try {
    const forms = await prisma.forms.findMany({
      where: {
        published: true,
        public: true,
      },
    });

    const workspaces = await prisma.workspaces.findMany({
      where: {
        collaborators: {
          some: {
            user_id: String(user_id),
          },
        },
        organization_id: org_id || "",
      },
      include: {
        organizations: {
          include: {
            admin: {
              select: {
                first_name: true,
                email: true,
                user_id: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ templates: forms, workspaces }, { status: 200 });
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
