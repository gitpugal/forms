import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { html, to, subject }: any = await req.json();
  console.log(html, to, subject);
  if (!html && !to && !subject) {
    console.log("Fields missing");
    return NextResponse.json(
      { message: "Html, to and subject fields are required" },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "pugalarasan2014@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    // Await the sendMail call and get the result
    const info = await transporter.sendMail({
      from: "pugalarasan2014@gmail.com",
      to: to,
      subject: subject,
      html: html,
    });

    console.log(info.response);
    // Send a response when mail is successfully sent
    return NextResponse.json(
      {
        message: "Mail sent successfully!",
        mailId: info.response,
      },
      { status: 200 }
    );
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal server error", error: e?.message },
      { status: 500 }
    );
  }
}
