// pages/api/form.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
export async function POST(req: NextRequest) {
  const { form_id, code } = await req.json();

  try {
    // Fetch form data including form_json
    let form: any = await prisma.forms.findUnique({
      where: {
        form_id: form_id,
      },
    });

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://form-x-eight.vercel.app/addTokenToForm"
    );

    oAuth2Client.setCredentials({
      scope: "https://www.googleapis.com/auth/spreadsheets",
    });

    const tokens = await oAuth2Client.getToken(code);
    console.log(tokens);

    const token = tokens.tokens.access_token;
    const refreshToken = tokens.tokens.refresh_token;

    const formJson = form.form_json; // Assuming form_json is an array as shown
    const columnNames: string[] = [];
    formJson.forEach((block: any) => {
      // if (block?.data?.label) {
      //   columnNames.push(block.data.label);
      // } else {
      //   columnNames.push(item.data.type);
      // }
      if (block?.blocks) {
        block.blocks.forEach((item: any) => {
          if (item?.data?.label) {
            columnNames.push(item.data.label);
          } else {
            columnNames.push(item.type);
          }
        });
      }
    });

    console.log("columnNames: ", columnNames);
    // Authenticate with Google APIs
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const sheets = google.sheets({ version: "v4", auth });
    const response: any = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: form?.title || "New Sheet from API",
        },
      },
    });
    const appendOption = {
      spreadsheetId: response.data.spreadsheetId, //You will insert this later
      range: "Sheet1!A1", // Replace with your desired range (e.g., "Sheet1!A2" to append below the header row)
      resource: {
        values: [columnNames],
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

    const sheetId = response.data.spreadsheetId;
    console.log("Created Sheet ID:", sheetId);

    // // Update form with Google integration details
    const updatedForm = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        integrations: {
          ...form.integrations,
          google: {
            token: token,
            sheetId: sheetId,
            refreshToken: refreshToken,
          },
        },
      },
    });

    console.log("Updated Form:", updatedForm);

    return NextResponse.json({ form: updatedForm }, { status: 200 });
  } catch (error: any) {
    if (error?.code == 403) {
      console.log(error);
      return NextResponse.json(
        { message: error?.errors[0].message },
        { status: 500 }
      );
    }
    console.error("Error creating sheet or updating form:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
