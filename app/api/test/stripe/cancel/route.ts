import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { subscriptionId, userId, transactionId, revert } = data;

    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      return new NextResponse("No user present for this id", { status: 400 });
    }

    const userSubscription = await prisma.subscriptions.findUnique({
      where: {
        subscription_id: subscriptionId,
      },
    });

    if (!userSubscription) {
      return new NextResponse("No subscription found for this id", {
        status: 404,
      });
    }

    // Update the subscription status in your database
    await prisma.subscriptions.update({
      where: {
        subscription_id: subscriptionId,
      },
      data: {
        status: revert ? "paid" : "canceled",
        cancel: revert ? false : true,
      },
    });

    return NextResponse.json({ result: {}, ok: true });
  } catch (error: any) {
    console.log(error);
    return new NextResponse(error, { status: 500 });
  }
}
