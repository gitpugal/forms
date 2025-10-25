import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, password, first_name, last_name }: any = await req.json();
  console.log(email, password);

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password length should be more than 6 characters" },
      { status: 400 }
    );
  }

  try {
    const hashPass = await hashPassword(password);
    const prevUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    console.log("Prev user: ", prevUser);
    const user = await prisma.users.create({
      data: {
        email: email,
        password: hashPass,
        first_name: first_name,
        last_name: last_name,
        onboarded: true,
      },
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const verification = await prisma.userVerification.create({
      data: {
        user_id: user.user_id,
        auth_key: generateAuthKey(),
        expires_at: expiresAt,
      },
    });

    const verificationLink = `https://form-x-eight.vercel.app/verify/${verification.auth_key}?user_id=${user.user_id}`;
    const response = await fetch(
      "https://form-x-eight.vercel.app/api/mail-services/smtp",
      {
        method: "POST",
        body: JSON.stringify({
          to: [user.email],
          subject: "Form Flow - Verify Your Form Flow Account",
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
                  <h2>Account Verification</h2>
                  <p>Click the button below to verify your account:</p>
                  <a target="_blank" href="${verificationLink}" class="button"
                    >Verify Account</a
                  >
                </div>
              </div>
            </div>
          </body>
        </html>
        `,
        }),
      }
    );
    if (response.status == 501) {
      const deleteUser = await prisma.users.delete({
        where: {
          user_id: user.user_id,
        },
      });
      console.log(deleteUser);
      try {
        const deleteUserVerification = await prisma.userVerification.delete({
          where: {
            verification_id: verification?.verification_id,
          },
        });
        console.log(deleteUserVerification);
      } catch (error) {}
      console.log(deleteUser);
      console.error("Error sending email: ");
      return NextResponse.json({ message: "" }, { status: 400 });
    } else {
      return NextResponse.json({ user, verification }, { status: 200 });
    }
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        const message =
          target === "email"
            ? "Email already exists"
            : target === "username"
            ? "Username already exists"
            : "Unique constraint violation";

        return NextResponse.json({ message }, { status: 400 });
      }
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
const hashPassword = async (string: string) => {
  const result = await bcrypt.hash(string, 10);
  return result;
};

const generateAuthKey = () => {
  return crypto.randomBytes(8).toString("hex"); // Generates a 16 character long string
};
