"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Check, FlameIcon, Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { toast, useToast } from "./ui/use-toast";
type Props = {
  pricing: any[];
  subscription: any[];
  fetchsubscription: any;
  fetching: boolean;
};

const SubscribeComponent = ({
  pricing,
  subscription,
  fetchsubscription,
  fetching,
}: Props) => {
  const { data: session, status, update }: any = useSession();
  const [cancelDialog, setCancelDialog] = useState(false);
  const [proDialog, setProDialog] = useState(false);

  const [isDeleting, setisDeleting] = useState(false);
  const [isUpgrading, setisUpgrading] = useState(false);
  const [upgradingId, setupgradingId]: any = useState(null);
  const [subscriptions, setsubscriptions] = useState(subscription);
  const [fetchings, setFetchings] = useState(fetching);
  const { toast } = useToast();
  useEffect(() => {
    setsubscriptions(subscription);
  }, [subscription]);

  useEffect(() => {
    setFetchings(fetching);
  }, [fetching]);

  // const handleSubmit = async (price_id: string) => {
  //   const stripe = await loadStripe(
  //     process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  //   );
  //   if (!stripe) {
  //     return;
  //   }
  //   try {
  //     setisUpgrading(true);
  //     const response = await fetch("/api/stripe/checkout", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         priceId: price_id,
  //         user_id: session?.user?.user_id,
  //       }),
  //     });
  //     const data = await response.json();
  //     if (!data.ok) {
  //       setisUpgrading(false);
  //       toast({
  //         title: "Something went wrong",
  //         description: "Try again later",
  //         duration: 3000,
  //         variant: "destructive",
  //       });
  //     } else {
  //       setisUpgrading(false);
  //       fetchsubscription();
  //     }
  //     await stripe.redirectToCheckout({
  //       sessionId: data.result.id,
  //     });
  //   } catch (error) {
  //     setisUpgrading(false);
  //     console.log(error);
  //   }
  //   setisUpgrading(false);
  // };

  const handleSubmit = async (price_id: string, name: string) => {
    try {
      setupgradingId(price_id);
      setisUpgrading(true);
      const response = await fetch("/api/test/membership", {
        method: "POST",
        body: JSON.stringify({
          priceId: price_id,
          user_id: session?.user?.user_id,
          name: name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setisUpgrading(false);
        toast({
          title: "Something went wrong",
          description: "Try again later",
          duration: 3000,
          variant: "destructive",
        });
      } else {
        setisUpgrading(false);
        fetchsubscription();
      }
      // await stripe.redirectToCheckout({
      //   sessionId: data.result.id,
      // });
      setupgradingId(null);
    } catch (error) {
      setupgradingId(null);

      setisUpgrading(false);
      console.log(error);
    }
    setProDialog(false);
    setupgradingId(null);
    setisUpgrading(false);
  };
  const cancelSubscription = async (price_id: string, revert: boolean) => {
    setisDeleting(true);
    try {
      const response = await fetch("/api/test/stripe/cancel", {
        method: "POST",
        body: JSON.stringify({
          priceId: price_id,
          userId: session?.user?.user_id,
          subscriptionId: subscriptions[0]?.subscription_id,
          transactionId: subscriptions[0]?.transaction_id,
          revert,
        }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error("Something went wrong");
      else {
        toast({
          title: revert
            ? "Subscription cancellation request Withdrawn successfully"
            : `Subscription canceled. will end at ${new Date(
                subscriptions[0]?.expires_at
              ).toLocaleDateString()}`,
          duration: 3000,
        });

        fetchsubscription();
      }
      setisDeleting(false);
      setCancelDialog(false);
    } catch (error) {
      setisDeleting(false);
      console.log(error);
    }
    setisDeleting(false);
  };
  return (
    <div
      className={`grid ${
        !subscriptions || subscriptions?.length == 0
          ? "md:grid-cols-3"
          : "grid-cols-1"
      }  gap-10 mt-4 md:my-10 md:mt-0 w-full`}
    >
      {!fetchings ? (
        subscriptions?.length == 0 ? (
          pricing.map((plan, index) => (
            <div
              key={index}
              className={`flex  bg-white flex-col items-center justify-between gap-4 rounded-2xl border p-8 relative ${
                index == 1 && "md:shadow-2xl md:scale-110"
              }`}
            >
              <div className="absolute right-4 top-4">
                {plan.shortTitle === "Basic" ? (
                  <FlameIcon
                    className="inline bg-red-400 bg-clip-text pb-[2px] text-orange-600"
                    size={30}
                    fill="orange"
                  />
                ) : null}
              </div>
              <div className="flex flex-row items-center gap-3">
                <p className="font-bold text-5xl flex-1"> {plan.price}</p>
              </div>
              <p className="font-light text-base text-center">
                {plan.shortTitle}
              </p>
              <div className="w-full flex flex-col items-start justify-center gap-1 mt-3">
                {plan.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex flex-row items-center gap-2">
                    <Check size={20} className="text-teal-400" />
                    <p className="font-light text-sm text-start">{feature}</p>
                  </div>
                ))}
              </div>
              <Button
                disabled={!plan.price_id || isUpgrading || fetchings}
                onClick={() => handleSubmit(plan?.price_id, plan?.shortTitle)}
                className="mt-5 w-full"
              >
                {isUpgrading && upgradingId == plan?.price_id && (
                  <Loader2Icon className="inline mr-2 animate-spin" />
                )}
                Get Started
              </Button>
            </div>
          ))
        ) : (
          subscriptions?.length > 0 && (
            <div className="bg-[#f5f5f5] text-[#0f0f0f]  rounded-2xl p-6 md:p-10 w-full text-center  relative">
              <p className=" text-md md:text-xl opacity-90 md:mb-4">
                Current Plan
              </p>
              <div className=" absolute md:top-10 md:left-10 top-6 left-6 text-green-500 flex flex-row items-center justify-between gap-1">
                <div className="h-[10px] w-[10px] rounded-full bg-green-500" />
                <p className="text-sm font-semibold py-[3px] ">Active</p>
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl mb-4">
                  {
                    pricing?.find(
                      (plan) => plan?.price_id == subscriptions[0]?.price_id
                    )?.shortTitle
                  }{" "}
                  Plan
                </h2>
                <p
                  className={`text-md  font-light mb-6 ${
                    subscriptions[0]?.cancel &&
                    "bg-red-500 text-white px-3 py-2 rounded-md font-semibold   text-xs md:text-sm w-fit mx-auto"
                  }`}
                >
                  Your{" "}
                  {
                    pricing?.find(
                      (plan) => plan?.price_id == subscriptions[0]?.price_id
                    )?.shortTitle
                  }
                  {subscriptions[0]?.cancel
                    ? ` plan will be canceled on ${new Date(
                        subscriptions[0]?.expires_at
                      ).toLocaleDateString()}, As you have initiated subscription cancellation.`
                    : ` plan is active. It will automatically renwed on ${new Date(
                        subscriptions[0]?.expires_at
                      ).toLocaleDateString()}`}
                  .
                </p>
                <div className="grid md:flex md:grid-cols-2 grid-cols-1 justify-center gap-2 md:gap-4">
                  <Button
                    onClick={() => setCancelDialog(true)}
                    variant={"outline"}
                    className="bg-transparent w-auto text-[#4d4d4d] border-[#8e8e8e] hover:bg-[#0f0f0f] font-light hover:text-[#f5f5f5] px-8"
                  >
                    {subscriptions[0]?.cancel
                      ? " Withdraw subscription cancellation request "
                      : "Cancel Subscription"}
                  </Button>
                  {subscriptions[0]?.price_id ==
                    "price_1PlOYlSAhPobOiy7eYawyfJ7" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProDialog(true);
                      }}
                      className="text-white bg-[#343434] hover:bg-[#232323] hover:text-white font-light scale-105"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        )
      ) : (
        <>
          {!subscription && !subscriptions ? (
            <div className="w-full flex items-center justify-center mt-20">
              <Loader2Icon className="animate-spin" />
            </div>
          ) : (
            pricing.map((plan, index) => (
              <div
                key={index}
                className={`flex  bg-white flex-col items-center justify-between gap-4 rounded-2xl border p-8 relative ${
                  index == 1 && "md:shadow-2xl md:scale-110"
                }`}
              >
                <div className="absolute right-4 top-4">
                  {plan.shortTitle === "Basic" ? (
                    <FlameIcon
                      className="inline bg-red-400 bg-clip-text pb-[2px] text-orange-600"
                      size={30}
                      fill="orange"
                    />
                  ) : null}
                </div>
                <div className="flex flex-row items-center gap-3">
                  <p className="font-bold text-5xl flex-1"> {plan.price}</p>
                </div>
                <p className="font-light text-base text-center">
                  {plan.shortTitle}
                </p>
                <div className="w-full flex flex-col items-start justify-center gap-1 mt-3">
                  {plan.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex flex-row items-center gap-2">
                      <Check size={20} className="text-teal-400" />
                      <p className="font-light text-sm text-start">{feature}</p>
                    </div>
                  ))}
                </div>
                <Button
                  disabled={!plan.price_id || isUpgrading || fetchings}
                  onClick={() => handleSubmit(plan?.price_id, plan?.shortTitle)}
                  className="mt-5 w-full"
                >
                  {isUpgrading && upgradingId == plan?.price_id && (
                    <Loader2Icon className="inline mr-2 animate-spin" />
                  )}
                  Get Started
                </Button>
              </div>
            ))
          )}
        </>
      )}

      {/* {fetchings && (
        <div className="w-full flex items-center justify-center mt-20">
          <Loader2Icon className="animate-spin" />
        </div>
      )} */}
      <Dialog
        open={cancelDialog}
        onOpenChange={(e) => {
          setCancelDialog(e);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {subscriptions && subscriptions[0]?.cancel
                ? "Withdraw cancellation"
                : "Cancel subscription"}
            </DialogTitle>
            <DialogDescription>
              {subscriptions && subscriptions[0]?.cancel
                ? "Are you sure to withdraw your cancellation request."
                : "Are you sure you want to Cancel your subscription"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-row items-center justify-between">
            <Button
              onClick={() => {
                setCancelDialog(false);
              }}
              type="button"
              className="outline"
              variant={"destructive"}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                cancelSubscription(
                  subscriptions[0]?.subscription_id,
                  subscriptions[0]?.cancel ? true : false
                )
              }
              type="button"
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2Icon className="inline mr-2 animate-spin" size={16} />
              )}{" "}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={proDialog}
        onOpenChange={(e) => {
          setProDialog(e);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to PRO</DialogTitle>
            <DialogDescription>
              Join our pro subscription to unlock all features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-row items-center justify-between">
            <Button
              onClick={() => {
                setProDialog(false);
              }}
              type="button"
              className="outline"
              variant={"destructive"}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleSubmit("price_1PiK7eSAhPobOiy76qNlS58X", "Pro")
              }
              type="button"
              disabled={isUpgrading}
            >
              {isUpgrading && (
                <Loader2Icon className="inline mr-2 animate-spin" size={16} />
              )}{" "}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscribeComponent;
