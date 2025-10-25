import prisma from "@/lib/prisma";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: Params) {
  const authKey = params.id;
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id") || "";

  // Check if user is already verified
  const isVerified = await prisma.users.findUnique({
    where: {
      user_id: user_id,
    },
    select: {
      verified: true,
    },
  });

  if (isVerified?.verified) {
    return NextResponse.json(
      { message: "Account Already Verified!" },
      { status: 202 }
    );
  }

  // Verify the user using auth key
  const userVerification = await prisma.userVerification.findFirst({
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
      { message: "Verification link expired!" },
      { status: 404 }
    );
  }

  // Update user as verified
  const updateUser = await prisma.users.update({
    where: {
      user_id: user_id,
    },
    data: {
      verified: true,
    },
  });

  // Create a default organization for the user
  const organization = await prisma.organizations.create({
    data: {
      name: "Default",
      admin_id: user_id,
    },
  });

  // Create a default workspace and add the user as admin
  const workspace = await prisma.workspaces.create({
    data: {
      name: "My Workspace",
      description: "My default workspace",
      organization_id: organization.organization_id,
      collaborators: {
        create: {
          user_id: user_id,
          role: "admin",
        },
      },
    },
  });

  // Add user to the organization with the default workspace
  await prisma.userOrganization.create({
    data: {
      user_id: user_id,
      organization_id: organization.organization_id,
    },
  });

  console.log(workspace);

  return NextResponse.json(
    {
      message: "Your account has been verified successfully!",
      user: updateUser,
    },
    { status: 200 }
  );
}
