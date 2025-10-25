import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { form_id, json, bannerUrl, logoUrl, theme, customTheme, published }: any =
    await req.json();

  try {
    const form = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        form_json: json,
        bannerUrl: bannerUrl ? bannerUrl : null,
        logoUrl: logoUrl ? logoUrl : null,
        theme: theme,
        customTheme: customTheme,
        published: published,
      },
    });

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
