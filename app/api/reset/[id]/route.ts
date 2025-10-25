import prisma from "@/lib/prisma";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest, { params }: Params) {
  const authKey = params.id;
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id") || "";

  const user = await prisma.users.findUnique({
    where: {
      user_id: user_id,
    },
    select: {
      verified: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid reset link!" },
      { status: 404 }
    );
  }

  // Verify the user using auth key
  const userVerification = await prisma.userPasswordReset.findFirst({
    where: {
      user_id: user_id,
      auth_key: authKey,
    },
  });

  if (!userVerification) {
    return NextResponse.json(
      { message: "Invalid verification link" },
      { status: 401 }
    );
  }

  const expiresAt = new Date(userVerification.expires_at);
  if (expiresAt <= new Date()) {
    return NextResponse.json(
      { message: "Password Reset link expired!" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Valid password reset link!",
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { password, user_id } = await req.json();

  const user = await prisma.users.findFirst({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User with this email does not exist!" },
      { status: 404 }
    );
  }

  try {
    const hashPassword = async (string: string) => {
      const result = await bcrypt.hash(string, 10);
      return result;
    };
    const hashPass = await hashPassword(password);

    const updateUser = await prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        password: hashPass,
      },
    });
    console.log(updateUser);
    return NextResponse.json(
      { message: "Password reset successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error?.message || "An exception occured !" },
      { status: 400 }
    );
  }
}
