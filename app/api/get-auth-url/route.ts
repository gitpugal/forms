import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function POST(req: NextRequest) {
  const { form_id } = await req.json();
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://form-x-eight.vercel.app/addTokenToForm"
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl: string = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        // "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
      state: form_id,
    });

    // const code =
    //   "4/0ATx3LY6J325N-UEqKa_cxhQUt4a4FqifLtlQxJcySiMRARxOUQ9gdXjCXqmGS2O0kVXpIQ";
    // const tokens = await oAuth2Client.getToken(code);
    // console.log(tokens);
    // Return form responses in the response
    return NextResponse.json({ url: authorizeUrl }, { status: 200 });
  } catch (e) {
    console.error(e);
    // Handle errors
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
