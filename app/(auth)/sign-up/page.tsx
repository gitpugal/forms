"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirm_password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    first_name: z.string().min(3, {
      message: "First name must be at least 3 characters.",
    }),
    last_name: z.string().min(1, {
      message: "Last name must be at least 1 character.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"], // path of error
  });

const page = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setLoading(false);
        toast({
          title: "Sign up Sucess",
          description: "Check your mail and verify your account!",
          duration: 10000,
        });
        form.reset();
      } else {
        const { message } = await response.json();
        toast({
          title: "Can't Sign up",
          description: message,
          variant: "destructive",
          duration: 5000,
        });
        form.reset();

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast({
        title: "Can't Sign up",
        description: "An Exception Occured, Try Again later!",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  function handleSignUpWithApple() {}

  function handleSignUpWithGoogle() {
    signIn("google", { callbackUrl: "/dashboard" });
  }
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.data) {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    <div className="w-full h-full overflow-y-scroll custom-scrollbar flex flex-col items-center py-20">
      <p className="text-2xl text-center font-semibold">
        👋 Hello there, Create an account
      </p>
      <p className="text-center md:font-normal font-light">
        Sign up to create an account and get started
      </p>
      <div className="mt-8 md:mx-auto w-full md:max-w-md md:px-0 px-3">
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your irst name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your last name"
                      {...field}
                    />
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
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password again"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-neutral-600">
              By signing up, you agree to our{" "}
              <span className="text-black font-semibold">terms of service</span>{" "}
              and{" "}
              <span className="text-black font-semibold">privacy policy</span>.
            </p>
            <Button disabled={loading} type="submit" className="w-full">
              {loading && (
                <Loader2 className="inline mr-2 animate-spin" size={20} />
              )}
              Sign up
            </Button>
            <Link
              href={"/login"}
              className="text-blue-600 underline block text-sm "
            >
              Already having an account, login here
            </Link>
            <ThirdPartyLogin
              handleSignInWithGoogle={handleSignUpWithGoogle}
              headline="Sign up with"
              subHeadline="or Continue with"
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default page;
