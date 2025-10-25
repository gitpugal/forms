import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // const collaborators = await prisma.forms.findMany({
    //   where: {
    //     scheduler: false,
    //   },
    //   select: {
    //     form_responses: true,
    //     workspaces: {
    //       select: {
    //         collaborators: {
    //           select: {
    //             users: {
    //               select: {
    //                 email: true,
    //                 user_id: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // collaborators?.forEach(async (collaborator: any) => {
    //   const users = collaborator?.workspaces?.collaborators?.map(
    //     (user: any) => user?.users?.email
    //   );
    //   console.log(users);

    //   if (users.length > 0) {
    //     // Add email jobs to the queue
    //     await emailQueue.add("sendEmail", {
    //       emails: ["pugalarasan2014@gmail.com"], // Pass the email addresses
    //       subject: "Form flow response analytics",
    //       html: `<div><h1>Form responses</h1></div>`, // HTML email content
    //     });
    //   }
    // });
    await emailQueue.add("sendEmail", {
      emails: ["pugalarasan2014@gmail.com"], // Pass the email addresses
      subject: "Form flow response analytics",
      html: `<div><h1>BULLMQ CHECK</h1></div>`, // HTML email content
    });
    return NextResponse.json(
      {
        message: "Emails queued successfully",
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
