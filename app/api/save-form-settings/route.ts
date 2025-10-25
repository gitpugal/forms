import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData: any = await req.json();

  try {
    let form = await prisma.forms.update({
      where: {
        form_id: formData?.form_id,
      },
      data: {
        closed: formData?.closed,
        redirect: formData?.redirect,
        redirect_url: formData?.redirect_url,
        user_form_cache: formData?.user_form_cache,
        submission_limit:
          formData?.submission_limit && formData?.submission_limit > 0
            ? parseInt(formData?.submission_limit)
            : -1,
        api_key: formData?.api_key,
        api_enabled: formData?.api_enabled,
        email_notify: formData?.email_notify,
        branding: formData?.branding,
        public: formData?.public,
      },
    });

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        const message =
          target === "title"
            ? "Cannot update settings"
            : "Unique constraint  violation";
        return NextResponse.json({ message: message }, { status: 400 });
      }
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
