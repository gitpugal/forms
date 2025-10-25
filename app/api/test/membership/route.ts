import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  console.log(
    "==========================================/api/webhooks/payment - webhook hit"
  );
  const { priceId, user_id, name } = await request.json();
  try {
    try {
      const user: any = await prisma.users.findFirstOrThrow({
        where: {
          user_id: user_id,
        },
        include: {
          subscriptions: true,
        },
      });

      if (!user) {
        return new NextResponse("No user present for this id", {
          status: 400,
        });
      }

      const previousSubscription = user?.subscriptions?.find(
        (subscription: any) => subscription?.status == "paid"
      );
      if (previousSubscription) {
        // Update the subscription status in your database
        await prisma.subscriptions.update({
          where: {
            subscription_id: previousSubscription?.subscription_id,
          },
          data: {
            status: "canceled",
            cancel: true,
          },
        });
      }
      const subscription_id = randomUUID();
      const transaction_id = randomUUID();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      const newSubscription = await prisma.subscriptions.create({
        data: {
          status: "paid",
          expires_at: expiresAt,
          price_id: priceId,
          name: name,
          user_id: user_id,
          subscription_id: subscription_id,
          transaction_id: transaction_id,
        },
      });
      const updatedUser = await prisma.users.update({
        where: {
          user_id: user_id,
        },
        data: {
          pro: true,
          expires_at: expiresAt,
          stripe_id: "randomUUID",
        },
      });
      return NextResponse.json(
        { subscription: newSubscription },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return new Response("Server error", {
        status: 500,
      });
    }
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }
}
