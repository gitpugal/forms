import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function POST(req: NextRequest) {
  const { form_id, code } = await req.json();
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://form-x-eight.vercel.app/addTokenToForm"
    );

    const tokens = await oAuth2Client.getToken(code);
    console.log(tokens);

    // Return form responses in the response
    return NextResponse.json({ url: 'authorizeUrl' }, { status: 200 });
  } catch (e) {
    console.error(e);
    // Handle errors
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
