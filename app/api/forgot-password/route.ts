import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
export async function POST(req: NextRequest) {
  const { email }: any = await req.json();
  console.log("/api/forgot-password hit");

  try {
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    console.log(user);
    if (!user) {
      return NextResponse.json(
        { message: "User with this email does not exist!" },
        { status: 404 }
      );
    }

    if (user.login_type === "google") {
      return NextResponse.json(
        {
          message:
            "Please login with Google, as you created your account with Google.",
        },
        { status: 401 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const verification = await prisma.userPasswordReset.create({
      data: {
        user_id: user.user_id,
        auth_key: generateAuthKey(),
        expires_at: expiresAt,
      },
    });

    const transporter = await nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "pugalarasan2014@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const verificationLink = `https://form-x-eight.vercel.app/reset-password/${verification.auth_key}?user_id=${user.user_id}`;
    const mailOptions: nodemailer.SendMailOptions = {
      from: "pugalarasan2014@gmail.com",
      to: user.email,
      subject: "Form Flow - Reset Flow Account Password",
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Verification</title>
    <style>
      .logo-container {
        max-width: 800px !important;
        text-align: center !important;
      }

      .heading {
        font-size: 3rem !important;
        font-weight: 200 !important;
        color: #282828 !important;
        margin-bottom: 15px;
      }

      .gradient-text {
        font-family: serif !important;
        font-style: italic !important;
        font-weight: 600 !important;
        background-image: linear-gradient(
          to right,
          #3b82f6,
          #4ade80
        ) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        color: transparent !important;
        overflow: visible !important;
        padding-left: 10px !important;
      }

      .description {
        font-size: 0.8rem !important;
        color: rgba(0, 0, 0, 0.7) !important;
        text-align: center !important;
        width: 75% !important;
        margin: auto !important;
      }

      /* Rest of the CSS for the email template */
      .outer-container {
        font-family: Arial, sans-serif !important;
        background-color: #f4f4f4 !important;
        margin: 0 !important;
        padding: 50px !important;
      }

      .container {
        max-width: 450px !important;
        margin: 20px auto !important;
        padding: 20px !important;
        background-color: #fff !important;
        border-radius: 10px !important;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1) !important;
      }

      .content {
        text-align: center !important;
        margin-top: 20px !important;
      }

      .button {
        display: inline-block !important;
        padding: 10px 20px !important;
        background-color: #007bff !important;
        color: #fff !important;
        text-decoration: none !important;
        border-radius: 5px !important;
        margin-top: 20px !important;
      }
    </style>
  </head>
  <body>
    <div class="outer-container">
      <div class="container">
        <div class="logo-container">
          <p class="heading">Form<span class="gradient-text">flow</span></p>
        </div>
        <p class="description">
          Revolutionize Your Form-Building Experience and Redefine Web
          Interaction
        </p>
        <div class="content">
          <h2>Reset Password</h2>
          <p>Click the button below to reset your password:</p>
          <a target="_blank" href="${verificationLink}" class="button"
            >Reset Pasword</a
          >
        </div>
      </div>
    </div>
  </body>
</html>
`,
    };
    const mailResponse = await transporter.sendMail(mailOptions);
    console.log(mailResponse);
    return NextResponse.json(
      {
        message: "Password reset link sent to your email.",
        user: {
          ...user,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.log("sign in error");
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json(
          { message: "User with this email not found!" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

const generateAuthKey = () => {
  return crypto.randomBytes(8).toString("hex"); // Generates a 16 character long string
};
