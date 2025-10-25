"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThirdPartyLogin } from "@/components/ThirdPartyLogin";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

const page = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setLoading(false);
        const data = await response.json();
        console.log(data);
        data.user.org_name = data?.user?.organizations.name;
        data.user.organization_id = data?.user?.organizations.organization_id;
        data.user.org_disabled = data?.user?.organizations.disabled;
        delete data?.user?.organizations;
        const serializedSubscriptions = JSON.stringify(
          data?.user?.subscriptions || []
        );
        localStorage?.setItem("formflowuseremail", data?.user?.email);
        await signIn("credentials", {
          ...data.user,
          subscriptions: serializedSubscriptions,
          callbackUrl: "https://form-x-eight.vercel.app/dashboard",
        });
      } else {
        const { message } = await response.json();
        toast({
          title: "Can't Sign in",
          description: message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast({
        title: "Can't Sign In",
        description: "An Exception Occured, Try Again later!",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  function handleSignInWithApple() {}

  async function handleSignUpWithGoogle() {
    const response = await signIn("google", { callbackUrl: "/dashboard" });
    console.log(response);
  }

  useEffect(() => {
    if (searchParams.get("from_reset")) {
      if (window) {
        window.location.href = "https://form-x-eight.vercel.app/login";
      }
    }
    if (session) {
      router.push("/dashboard");
    }
    if (searchParams.get("loginTypeError") == "true") {
      setTimeout(() => {
        toast({
          title: "You Must login with email and password",
          description: "Don't login with google, use your credentials.",
          variant: "destructive",
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-y-scroll custom-scrollbar flex-col">
      <p className="text-2xl font-semibold">👋 Welcome back!</p>
      <p>Log in to your account !</p>
      <div className="mt-8 md:mx-auto w-full md:max-w-md md:px-0 px-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white px-4 py-8 shadow rounded-2xl sm:px-10 space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit" className="w-full">
              {loading && (
                <Loader2 className="inline mr-2 animate-spin" size={20} />
              )}
              Log in
            </Button>
            <p className="text-sm w-full flex items-center justify-between gap-2">
              <span className="underline text-blue-600">
                {" "}
                <Link href={"/sign-up"}>create an account</Link>
              </span>

              <span className="underline text-blue-600">
                {" "}
                <Link href={"/forgot-password"}>Forgot password?</Link>
              </span>
            </p>

            <ThirdPartyLogin
              handleSignInWithGoogle={handleSignUpWithGoogle}
              headline="Sign in with"
              subHeadline="or Continue with"
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default page;
