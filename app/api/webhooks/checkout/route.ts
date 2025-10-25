import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { fromUnixTime } from "date-fns";

type METADATA = {
  userId: string;
  priceId: string;
  subscription_id: string;
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  console.log(
    "==========================================/api/webhooks/payment - webhook hit"
  );
  const body = await request.text();
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
  const sig = headers().get("stripe-signature") as string;
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  const eventType = event.type;

  const data: any = event.data.object;
  switch (eventType) {
    case "checkout.session.completed":
      const metadata = data.metadata as any;

      try {
        const user: any = await prisma.users.findFirstOrThrow({
          where: {
            user_id: metadata?.userId,
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
          (subscription: any) =>
            subscription?.status == "paid" &&
            subscription?.subscription_id != metadata?.subscription_id
        );
        if (previousSubscription) {
          // cancel old subscription
          try {
            const canceledSubscription = await stripe.subscriptions.cancel(
              previousSubscription?.transaction_id
            );
          } catch (e) {
            console.log("cannot cancel the usvsiproin");
            console.log(e);
          }

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
        if (metadata?.subscription_id) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          const updatedUserSubscription = await prisma.subscriptions.update({
            where: {
              subscription_id: metadata?.subscription_id,
            },
            data: {
              status: "paid",
              expires_at: expiresAt,
              transaction_id: data?.subscription,
              name:
                metadata?.priceId == "price_1PiK7eSAhPobOiy76qNlS58X"
                  ? "pro"
                  : "basic",
            },
          });
          const updatedUser = await prisma.users.update({
            where: {
              user_id: metadata?.userId,
            },
            data: {
              pro: true,
              expires_at: expiresAt,
              stripe_id: data?.customer ? data?.customer : user?.stripe_id,
            },
          });
        }
      } catch (error) {
        console.log(error);
        return new Response("Server error", {
          status: 500,
        });
      }
      break;
    case "customer.subscription.deleted":
      console.log(data);
      const user = await prisma.users.findFirstOrThrow({
        where: {
          stripe_id: data?.customer,
        },
        include: {
          subscriptions: true,
        },
      });
      if (user) {
        await prisma.subscriptions.updateMany({
          where: {
            user_id: user?.user_id,
            transaction_id: data?.id,
            price_id: data?.plan?.id,
          },
          data: {
            status: "deleted",
            cancel: true,
          },
        });

        const acitveSubscriptions = await prisma.subscriptions.findMany({
          where: {
            user_id: user?.user_id,
            status: "paid",
          },
        });
        if (acitveSubscriptions?.length == 0 || !acitveSubscriptions) {
          await prisma.users.update({
            where: {
              user_id: user?.user_id,
            },
            data: {
              pro: false,
              expires_at: null,
            },
          });
        }
      }
      break;
    case "customer.subscription.updated":
      console.log(data);

      try {
        const expiresAt = fromUnixTime(data?.current_period_end);
        const subscription = await prisma.subscriptions.findFirstOrThrow({
          where: {
            transaction_id: data?.id,
          },
        });
        if (subscription) {
          await prisma.subscriptions.updateMany({
            where: {
              transaction_id: data?.id,
            },
            data: {
              expires_at: expiresAt,
            },
          });

          const user = await prisma.users.findFirstOrThrow({
            where: {
              stripe_id: data?.customer,
            },
            include: {
              subscriptions: true,
            },
          });

          if (user) {
            await prisma.users.update({
              where: {
                stripe_id: data?.subscription,
                user_id: user?.user_id,
              },
              data: {
                expires_at: expiresAt,
              },
            });
          }
        }
      } catch (error: any) {
        return new Response(error, {
          status: 500,
        });
      }
    default:
      console.log(`Unhandled event type ${event.type}`);
      return new Response("Unhandled stripe event", {
        status: 200,
      });
  }
  return new Response("Subscription added", {
    status: 200,
  });
}
