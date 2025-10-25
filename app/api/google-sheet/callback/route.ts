// pages/api/google-sheets/callback.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { message: "Authorization code is missing" },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://form-x-eight.vercel.app/api/auth/callback/google"
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens)

    // Save tokens in your database
    // await prisma.users.update({
    //   where: { id: userId }, // Replace with the actual user ID
    //   data: { googleTokens: tokens },
    // });

    return NextResponse.json(
      { message: "Tokens saved successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
