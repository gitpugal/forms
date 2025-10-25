import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    console.log("DAILY- update API hit");
    const collaborators = await prisma.forms.findMany({
      where: {
        scheduler: false,
        published: true,
      },
      select: {
        form_responses: true,
        title: true,
        description: true,
        workspaces: {
          select: {
            collaborators: {
              select: {
                users: {
                  select: {
                    email: true,
                    user_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Use Promise.all with map to handle asynchronous operations
    const mailResIds = await Promise.all(
      collaborators?.map(async (collaborator: any) => {
        const users: string[] = collaborator?.workspaces?.collaborators?.map(
          (user: any) => user?.users?.email
        );

        const generateFormResponseColumnsAndRows = (
          formResponses: any[]
        ): { columns: any[]; rows: any[][] } => {
          const uniqueFields: any[] = [];
          let count = 1;

          formResponses?.forEach((response: any) => {
            Object.keys(response.responses).forEach((field) => {
              if (!uniqueFields.some((f) => f.key === field)) {
                if (field === "") {
                  uniqueFields.push({
                    name: "Untitled field " + count,
                    key: field,
                  });
                  count += 1;
                } else {
                  uniqueFields.push({ name: field, key: field });
                }
              }
            });
          });

          const rows: any[][] = [];
          formResponses?.forEach((response: any) => {
            const row: any[] = [];
            uniqueFields.forEach((field) => {
              row.push(response.responses[field.key] || "");
            });
            rows.push(row);
          });

          return { columns: uniqueFields, rows };
        };

        const { columns, rows } = generateFormResponseColumnsAndRows(
          collaborator?.form_responses
        );

        try {
          const date = new Date();
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let currentDate = `${day}-${month}-${year}`;

          const response = await fetch(
            "https://form-x-eight.vercel.app/api/mail-services/smtp",
            {
              method: "POST",
              body: JSON.stringify({
                to: [users?.toString()],
                subject: `Form Flow - Daily analytics ${collaborator?.title} (${currentDate})`,
                html: `
                  <div>
                    <h1>Form responses - ${
                      collaborator?.title
                    } (${currentDate})</h1>
                    <table style="border-collapse: collapse; width: 100%;">
                      <thead>
                        <tr>
                          ${columns
                            .map(
                              (column) =>
                                `<th style="border: 1px solid #ddd; padding: 8px;">${column.name}</th>`
                            )
                            .join("")}
                        </tr>
                      </thead>
                      <tbody>
                        ${rows
                          .map(
                            (row) => `
                          <tr>
                            ${row
                              .map(
                                (value) =>
                                  `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`
                              )
                              .join("")}
                          </tr>
                        `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                `,
              }),
            }
          );

          if (response.status === 501) {
            throw new Error("Cannot send mail, try again");
          }

          const data = await response.json();
          console.log("smtp API success", data);
          return data; // Push the response data
        } catch (error: any) {
          console.error("Error sending mail:", error);
          return { error: error?.message };
        }
      })
    );

    return NextResponse.json(
      {
        message: "Mail sent successfully",
        collaborators: collaborators.length,
        mailResIds,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ e }, { status: 500 });
  }
}
