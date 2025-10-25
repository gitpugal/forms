import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export async function POST(request: NextRequest) {
  console.log(
    "API HIT - /api/stripe/checkout - ( stripe:" +
      process.env.STRIPE_SECRET_KEY +
      ")"
  );

  try {
    const data = await request.json();
    const priceId = data.priceId;
    const user_id = data.user_id;
    console.log(data);
    const user = await prisma.users.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!user) {
      return new NextResponse("No user present for this id", { status: 400 });
    }
    await prisma.subscriptions.deleteMany({
      where: {
        user_id: user_id,
        status: "idle",
      },
    });
    const userSubscription = await prisma.subscriptions.create({
      data: {
        price_id: priceId,
        user_id: user_id,
        status: "idle",
      },
    });
    console.log(
      "Created subscription- ( stripe:" + process.env.STRIPE_SECRET_KEY + ")"
    );
    console.log(userSubscription);
    if (!userSubscription) {
      return new NextResponse("Cannot create payment session try again later", {
        status: 401,
      });
    }
    let sessionFields: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_BASE_URL}/settings/profile?payment_status=success&transaction_id=${userSubscription?.subscription_id}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/settings/profile?payment_status=failed&transaction_id=${userSubscription?.subscription_id}`,
      metadata: {
        userId: user_id,
        priceId,
        subscription_id: userSubscription?.subscription_id,
      },
      customer_email: user?.email,
    };
    if (user?.stripe_id) {
      sessionFields["customer"] = user?.stripe_id;
      delete sessionFields["customer_email"];
    }
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(sessionFields);
    console.log("( stripe:" + process.env.STRIPE_SECRET_KEY + ")");
    return NextResponse.json({
      result: checkoutSession,
      ok: true,
      message: "( stripe:" + process.env.STRIPE_SECRET_KEY + ")",
    });
  } catch (error: any) {
    console.log(error);
    return new NextResponse(
      error + "( stripe:" + process.env.STRIPE_SECRET_KEY + ")",
      { status: 500 }
    );
  }
}
