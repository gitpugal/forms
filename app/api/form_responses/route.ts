import prisma from "@/lib/prisma";
// @ts-ignore
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Client } from "@notionhq/client";
import { OAuth2Client } from "google-auth-library";

async function refreshAccessToken(refreshToken: string, acc: string) {
  console.log(
    "======================================REFRESHING ACCESS TOKEN ========================================="
  );
  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://form-x-eight.vercel.app/api/auth/callback/google"
  );
  auth.setCredentials({ refresh_token: refreshToken, access_token: acc });

  try {
    const token = await auth.refreshAccessToken();
    console.log("TOKEN: ", token);
    console.log(
      "======================================END REFRESHING ACCESS TOKEN ========================================="
    );
    return token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh access token");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { form_id, responses } = await req.json();

    if (!form_id || !responses) {
      return NextResponse.json(
        { message: "Form ID and responses are required" },
        { status: 400 }
      );
    }

    // Fetch form data to get Google Sheets integration details
    const form = await prisma.forms.findUnique({
      where: {
        form_id: form_id,
      },
    });

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }
    const integrations = form.integrations as any;

    /////////////////////////////////////////////    NOTION INTEGRATION   ////////////////////////////////////////////////
    if (integrations?.notion) {
      const client = new Client({ auth: integrations?.notion?.token });

      const properties: any = Object.fromEntries(
        integrations?.notion?.database_mappings?.map((map: any) => {
          const key = Object.keys(map)[0];
          const value = map[key];

          return [
            value,
            {
              [integrations?.notion?.database_properties[map[key]]?.type]: [
                {
                  text: {
                    content: responses[key] || "",
                  },
                },
              ],
            },
          ];
        })
      );

      console.log("properties: ", properties);

      // Ensure richTextProperties conforms to t

      const response = await client.pages.create({
        parent: { database_id: integrations.notion.database_id },
        properties: properties,
      });
      console.log(response);
    }
    /////////////////////////////////////////////    NOTION INTEGRATION END   ////////////////////////////////////////////////

    /////////////////////////////////////////////    GOOGLE SHEET INTEGRATION   ////////////////////////////////////////////////
    const googleIntegration = integrations?.google;

    if (googleIntegration) {
      let { token, refreshToken, sheetId } = googleIntegration;

      // Authenticate with Google APIs
      const auth = new google.auth.OAuth2({
        credentials: {
          refresh_token: refreshToken,
          access_token: token,
          token_type: "Bearer",
        },
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: "https://form-x-eight.vercel.app/addTokenToForm",
      });

      const sheets = google.sheets({ version: "v4", auth });

      try {
        // Get the column headers
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "Sheet1!1:1", // Assumes headers are in the first row
        });

        let headers = headerResponse.data.values
          ? headerResponse.data.values[0]
          : [];

        // Check if there are new fields to add as new columns
        const newHeaders = Object.keys(responses).filter(
          (header) => !headers.includes(header)
        );

        if (newHeaders.length > 0) {
          // Add new headers to the existing headers
          headers = [...headers, ...newHeaders];

          // Update the header row in the sheet
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: "Sheet1!1:1",
            valueInputOption: "RAW",
            requestBody: {
              values: [headers],
            },
          });
        }

        // Map responses to the correct columns
        const rowToAppend = headers.map((header) => responses[header] || "");

        // Append the new row of responses to the sheet
        const appendOption = {
          spreadsheetId: sheetId,
          range: "Sheet1!A2", // Adjust the range as needed
          resource: {
            values: [rowToAppend],
          },
          valueInputOption: "USER_ENTERED",
        };

        await sheets.spreadsheets.values.append(appendOption);
      } catch (error: any) {
        console.log(
          "============================================START======================================================="
        );
        console.log("Old Acc token: ", token);
        console.log("Old Ref token: ", refreshToken);
        console.log(
          "==============================================END====================================================="
        );
        console.log(error);

        if (error?.code >= 400) {
          // Token might be expired, try refreshing
          console.log(
            "=============================================TOKEN EXPIRED======================================================"
          );
          const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://form-x-eight.vercel.app/addTokenToForm"
          );

          const tokens = await oAuth2Client.getToken(refreshToken);
          console.log(tokens);
          const newAccessToken = tokens.tokens.access_token;

          const auth = new google.auth.OAuth2({
            credentials: {
              refresh_token: refreshToken,
              access_token: newAccessToken,
              token_type: "Bearer",
            },
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: "https://form-x-eight.vercel.app/addTokenToForm",
          });

          const sheets = google.sheets({ version: "v4", auth });
          console.log(
            "=============================================START======================================================"
          );
          console.log("New Acc token: ", newAccessToken);
          console.log(
            "=============================================END======================================================"
          );

          const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "Sheet1!1:1", // Assumes headers are in the first row
          });

          let headers = headerResponse.data.values
            ? headerResponse.data.values[0]
            : [];

          const newHeaders = Object.keys(responses).filter(
            (header) => !headers.includes(header)
          );

          if (newHeaders.length > 0) {
            headers = [...headers, ...newHeaders];

            await sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: "Sheet1!1:1",
              valueInputOption: "RAW",
              requestBody: {
                values: [headers],
              },
            });
          }

          const rowToAppend = headers.map((header) => responses[header] || "");

          const appendOption = {
            spreadsheetId: sheetId,
            range: "Sheet1!A2", // Adjust the range as needed
            resource: {
              values: [rowToAppend],
            },
            valueInputOption: "USER_ENTERED",
          };

          await sheets.spreadsheets.values.append(appendOption);
        } else {
          console.error("Error appending to Google Sheet:", error);
          throw new Error("Error appending to Google Sheet");
        }
      }
    }

    /////////////////////////////////////////////    GOOGLE SHEET INTEGRATION END   ////////////////////////////////////////////////

    // Store response in the database
    const newResponse = await prisma.form_responses.create({
      data: {
        form_id,
        responses,
      },
    });

    // Increment the submitted count
    const formInc = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        submitted_count: {
          increment: 1,
        },
      },
    });

    console.log(formInc);

    return NextResponse.json({ response: newResponse }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: e.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const formId = url.searchParams.get("form_id") || "";
    // Check if form ID is provided
    if (!formId) {
      return NextResponse.json(
        { message: "Form ID is required" },
        { status: 400 }
      );
    }

    // Fetch form responses from the database using Prisma, filtered by form ID
    const formResponses = await prisma.form_responses.findMany({
      where: {
        form_id: formId, // Ensure form_id is a string
      },
    });

    // Return form responses in the response
    return NextResponse.json({ formResponses }, { status: 200 });
  } catch (e) {
    console.error(e);
    // Handle errors
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
