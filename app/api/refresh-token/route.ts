import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token:
        "ya29.a0AXooCgun1VnKU3YmIPZO1hD8yU-MhHPEEY6PjHxTNw1a_pXFN9ZTNlv8ggy4bCnAI241RSJBcgW-uASIfa3n2fBf5lETGz6UNnaEpgLJ09QLd1c2Uw5lZ-crP96UqfpkpGZzcG3IiqQkcml9YOditIAjt3rLtP0QJaEXaCgYKAfoSARISFQHGX2MiaDfw9AQae6ee0FSjsUkD5Q0171",
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response: any = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "New Sheet from API",
        },
      },
    });
    console.log(response)
    const appendOption = {
      spreadsheetId: response.data.spreadsheetId, //You will insert this later
      range: "Sheet1!A1", // Replace with your desired range (e.g., "Sheet1!A2" to append below the header row)
      resource: {
        values: [],
      },
      valueInputOption: "USER_ENTERED", // Set the desired option (USER_ENTERED or RAW)
    };

    await sheets.spreadsheets.values.append(
      appendOption,
      function (err: any, response: any) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
    return NextResponse.json({ url: "" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
