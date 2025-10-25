import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { first_name, last_name, phone, email, org_name }: any =
    await req.json();

  try {
    // Update user information
    const user = await prisma.users.update({
      where: {
        email: email,
      },
      data: {
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        onboarded: true,
      },
    });

    let organization;
    if (user && user.onboarded) {
      // Fetch the organization related to the user
      const userOrg = await prisma.userOrganization.findFirst({
        where: {
          user_id: user.user_id,
        },
        include: {
          organizations: true,
        },
      });

      if (userOrg) {
        // Update organization name
        organization = await prisma.organizations.update({
          where: {
            organization_id: userOrg.organization_id,
          },
          data: {
            name: org_name,
          },
        });

        // Fetch the updated organization details
        const orgs = await prisma.organizations.findMany({
          where: {
            organization_id: userOrg.organization_id,
          },
        });

        console.log("==============");
        console.log(orgs);
        console.log(user);
        return NextResponse.json(
          { user, organization: orgs[0] },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "User not onboarded" },
        { status: 400 }
      );
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
