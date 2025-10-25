// pages/api/form.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
export async function POST(req: NextRequest) {
  const { email, token, form_id, old_access_token } = await req.json();

  const fetchNotionDbs = async (token: string) => {
    const notion = new Client({ auth: token });

    const response: any = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
    });
    console.log("DB RSPONSE: ");
    console.log(response);
    return response;
  };
  try {
    // Fetch form data including form_json
    const user: any = await prisma.forms.findFirst({
      where: {
        form_id: form_id,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "form not found" }, { status: 404 });
    }
    let access_token: any = null;

    if (user?.integrations?.notion?.token) {
      console.log("Token alreadt present: ");
      access_token = user.integrations.notion.token;
    }
    console.log("TOKEN: ", token);
    const encodedCredentials = btoa(
      "1fb8f6c9-5e73-4c85-9351-5464b2ed2983:secret_Q0pQtrVYXSoE1EfIXXxgeCSP1s3tqQWecW8BI6gIuRj"
    ); // Base64 encode credentials
    if (old_access_token) {
      console.log("TOKEN A:REWADT THERE: ");
      const response: any = await fetchNotionDbs(old_access_token);
      console.log(response);
      return NextResponse.json(
        { databases: response?.results, form: user },
        { status: 200 }
      );
    } else if (!access_token) {
      console.log("TOKEN NOT PRESENT: ");
      const response = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: token,
          grant_type: "authorization_code",
          redirect_uri: "https://form-x-eight.vercel.app/notion",
        }),
      });
      console.log(response.ok);
      console.log(response.status);
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        // const access_token = "secret_UmdVwpQQOMNDoGTN5IIM7tgVQJYJuTBCA2pqzXR7A7C";
        console.log("NEW TOKEN OBJ: ");
        console.log(data);

        try {
          const updatedUser = await prisma.forms.update({
            where: {
              form_id: form_id,
            },
            data: {
              integrations: {
                ...user.integrations,
                notion: {
                  token: data.access_token,
                },
              },
            },
          });
          console.log(updatedUser);
          // Initialize Notion client
          const response: any = fetchNotionDbs(data?.access_token);
          return NextResponse.json(
            { databases: response?.results },
            { status: 200 }
          );
        } catch (error) {
          console.log(error);
          return NextResponse.json({ message: error }, { status: 500 });
        }
        // } else {
        //   console.log("error: ");
        //   const data = await response.json();
        //   console.log("Auht data: ", data);
        // }
        // Update form with Google integration details

        // console.log("Updated user:", updatedUser);
      }
    } else {
      console.log("TOKEN A:REWADT THERE: ");
      const response: any = await fetchNotionDbs(access_token);
      console.log(response);
      return NextResponse.json(
        { databases: response?.results, form: user },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error creating sheet or updating form:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
