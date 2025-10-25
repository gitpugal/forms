import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("/api/organization - GET ");
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  let org_id: any = url.searchParams.get("org_id");
  let order: any = url.searchParams.get("order");

  if (org_id == null || org_id == "null") {
    org_id = undefined;
  }

  console.log("org_id: ", org_id);
  if (!user_id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  const user = await prisma.users.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not present" }, { status: 404 });
  }
  try {
    const orderByconditions: Record<string, string>[] = [];
    if (order) {
      orderByconditions?.push({ formorder: "asc" });
    } else {
      orderByconditions?.push({ updated_at: "desc" });
    }

    orderByconditions?.push({ created_at: "desc" });
    const userOrganizations: any = await prisma.userOrganization.findMany({
      where: {
        user_id: String(user_id),
      },
      orderBy: {
        joined_at: "asc",
      },
      include: {
        organizations: {
          include: {
            admin: {
              select: {
                first_name: true,
                email: true,
              },
            },
            workspaces: {
              where: {
                collaborators: {
                  some: {
                    user_id: String(user_id),
                  },
                },
              },
              include: {
                collaborators: {
                  select: {
                    users: {
                      select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        profile_image: true,
                      },
                    },
                    role: true,
                  },
                },
                forms: {
                  where: {
                    trash: false,
                  },
                  orderBy: orderByconditions,
                },
              },
            },
          },
        },
      },
    });
    const recentForms = await prisma.forms.findMany({
      where: {
        workspaces: {
          organization_id:
            org_id != null && org_id != undefined
              ? org_id
              : userOrganizations[0]?.organization_id,
          collaborators: {
            some: {
              user_id: String(user_id),
            },
          },
        },
        trash: false,
      },
      orderBy: {
        updated_at: "desc",
      },
      take: 5,
    });

    return NextResponse.json(
      {
        organizations: userOrganizations.map((userOrg: any) => ({
          ...userOrg.organizations,
          admin: userOrg.organizations.admin,
        })),
        forms: recentForms,
      },
      { status: 200 }
    );
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
