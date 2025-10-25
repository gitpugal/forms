import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: Params) {
  const user_id = params.id;
  try {
    // Check if the form exists and if the API key is valid
    const user = await prisma.users.findFirst({
      where: { user_id },
      include: {
        subscriptions: {
          where: {
            status: {
              notIn: ["deleted", "idle"],
            },
          },
          orderBy: {
            expires_at: "desc",
          },
        },
      },
    });
    console.log(user);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
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
