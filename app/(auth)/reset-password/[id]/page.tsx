"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const Page = ({ params }: { params: { id: string } }) => {
  const authKey = params.id;
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [isResettingPass, setisResettingPass] = useState(false);
  const [credentialsMissing, setCredentialsMissing] = useState(true); // Set initial credentialsMissing state to true
  let isCalled = false;
  const router = useRouter();
  useEffect(() => {
    const verifyUser = async () => {
      isCalled = true;
      if (!user_id || !authKey) {
        setCredentialsMissing(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setCredentialsMissing(false);
      try {
        const response = await fetch(
          `/api/reset/${authKey}?user_id=${user_id}`
        );
        if (response.ok) {
          setVerified(true);
        } else {
          setVerified(false);
          const data = await response.json();
          toast({
            title: data?.message || "Could not reset password",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.log(error);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };
    if (!isCalled) {
      verifyUser();
    }
  }, []);

  const { toast } = useToast();
  const [email, setEmail]: any = useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    if (email?.password !== email?.confirmPass) {
      toast({
        title: "Password does not match!",
        description: "Password and confirm password do not match!",
        variant: "destructive",
        duration: 5000,
      });
    } else {
      setisResettingPass(true);
      try {
        const response = await fetch(`/api/reset/${authKey}`, {
          method: "POST",
          body: JSON.stringify({ user_id: user_id, password: email?.password }),
        });
        const data = await response.json();
        if (response.ok) {
          setisResettingPass(false);
          setEmail(null);
          console.log(data);
          toast({
            title: "Password Reset successful",
            description: "Your password has been reset successfully!",
            duration: 5000,
          });
          router.replace("https://form-x-eight.vercel.app/login?from_reset=true");
        } else {
          setisResettingPass(false);
          console.log(data);
          toast({
            title: "Can't send reset password",
            description:
              data?.message || "An Exception Occurred, Try Again later!",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (e) {
        setisResettingPass(false);
        console.log(e);
        toast({
          title: "Can't reset your password",
          description: "An Exception Occurred, Try Again later!",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      {loading ? (
        <Loader />
      ) : (
        <>
          {verified ? (
            <form
              onSubmit={onSubmit}
              className="flex flex-col items-start w-1/3 mx-auto justify-start gap-3 bg-white rounded-md px-10 py-20"
            >
              <p className="text-xl font-semibold mb-5">
                Reset Your password here
              </p>
              <Label>Password</Label>
              <Input
                onChange={(e: any) =>
                  setEmail((prev: any) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                value={email?.password}
                type="password"
                name="password"
                required
                placeholder="Enter new password"
                className="mb-4"
              />

              <Label>Confirm Password</Label>
              <Input
                onChange={(e: any) =>
                  setEmail((prev: any) => ({
                    ...prev,
                    confirmPass: e.target.value,
                  }))
                }
                value={email?.confirmPass}
                type="password"
                name="confirmpassword"
                required
                placeholder="Confirm new password"
              />
              <Button
                disabled={isResettingPass}
                type="submit"
                className="w-full"
              >
                {isResettingPass && (
                  <Loader2 className="inline mr-2 animate-spin" size={20} />
                )}
                Reset Password
              </Button>
            </form>
          ) : credentialsMissing ? (
            <div className="w-full h-full flex items-center justify-center flex-col">
              <p className="text-2xl font-semibold text-red-600">
                Uh oh!, Not a valid verification link.
              </p>
              <p className="text-center">
                Check your email for a valid verification link
              </p>
            </div>
          ) : (
            <>
              <p className="text-3xl font-semibold text-red-600">
                Cannot verify you
              </p>
              <p className="text-center">
                Check your email for a valid verification link
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
