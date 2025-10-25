import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("/api/form - GET ");
  const url = new URL(req.url);
  const form_id = url.searchParams.get("form_id");
  const opened_count = url.searchParams.get("opened_count");
  console.log(form_id);
  if (!form_id) {
    return NextResponse.json(
      { message: "Form ID is required" },
      { status: 400 }
    );
  }

  try {
    const form = await prisma.forms.findUnique({
      where: {
        form_id: form_id,
        published: true,
      },
      include: {
        workspaces: {
          include: {
            collaborators: {
              where: {
                OR: [
                  { role: "orgadmin" },
                  { role: "admin" },
                ],
              },
              include: {
                users: {
                  select: {
                    pro: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (opened_count) {
    
      const formInc = await prisma.forms.update({
        where: {
          form_id: form_id,
        },
        data: {
          opened_count: {
            increment: 1,
          },
        },
      });
      console.log(formInc);
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, workspace_id, description }: any = await req.json();

  try {
    let form = await prisma.forms.create({
      data: {
        title: name,
        description: description,
        workspace_id: workspace_id,
      },
    });

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        const target = (e.meta as { target: string[] }).target[0];
        console.log(
          "---------------------------------------------------------------------------------------"
        );
        console.log(target);
        const message =
          target === "title" || target === "workspace_id"
            ? "Form name already exists"
            : "Unique constraint  violation";
        let form = await prisma.forms.findFirst({
          where: {
            title: name,
          },
        });
        return NextResponse.json(
          {
            message: form?.trash
              ? "Form already exists with same name in trash"
              : message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { form_id, status }: any = await req.json();

  try {
    const form = await prisma.forms.update({
      where: {
        form_id: form_id,
      },
      data: {
        published: status,
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

export async function DELETE(req: NextRequest) {
  const { form_id, move_to_trash, remove_from_trash, deletepermenant }: any =
    await req.json();

  try {
    let form;
    if (deletepermenant) {
      form = await prisma.forms.delete({
        where: {
          form_id: form_id,
        },
      });
    } else if (move_to_trash) {
      form = await prisma.forms.update({
        where: {
          form_id: form_id,
        },
        data: {
          trash: true,
        },
      });
    } else if (remove_from_trash) {
      form = await prisma.forms.update({
        where: {
          form_id: form_id,
        },
        data: {
          trash: false,
        },
      });
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
