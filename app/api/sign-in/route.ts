import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { email, password }: any = await req.json();
  console.log("/api/sign-in hit");
  console.log(email, password);

  try {
    const [user, updatedUser] = await prisma.$transaction([
      prisma.users.findUnique({
        where: { email },
        select: {
          email: true,
          password: true,
          user_id: true,
          collaborators: true,
          first_name: true,
          last_name: true,
          onboarded: true,
          phone: true,
          verified: true,
          last_logged_in: true,
          login_type: true,
          profile_image: true,
          pro: true,
          expires_at: true,
          organizations: {
            select: {
              organizations: {
                select: {
                  organization_id: true,
                  name: true,
                  disabled: true,
                  users: true,
                },
              },
            },
          },
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
      }),
      prisma.users.update({
        where: { email },
        data: {
          last_logged_in: new Date(),
        },
      }),
    ]);
    console.log(user);
    if (!user) {
      return NextResponse.json(
        { message: "User with this email does not exist!" },
        { status: 404 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        {
          message:
            "Email not verified. Please verify your email before logging in.",
        },
        { status: 401 }
      );
    }

    if (user.login_type === "google") {
      return NextResponse.json(
        {
          message:
            "Please login with Google, as you created your account with Google.",
        },
        { status: 401 }
      );
    }

    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Incorrect password" },
          { status: 401 }
        );
      }
    }

    const organizations = user.organizations.map((org: any) => ({
      organization_id: org.organizations.organization_id,
      name: org.organizations.name,
      disabled: org.organizations.disabled,
      users: org.organizations.users,
    }));

    return NextResponse.json(
      {
        message: "Sign-in successful",
        user: {
          ...user,
          organizations,
          last_logged_in: updatedUser.last_logged_in?.toLocaleString(),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.log("sign in error");
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json(
          { message: "User with this email not found!" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
