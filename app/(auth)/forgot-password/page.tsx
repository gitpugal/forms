"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const page = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  async function onSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setLoading(false);
        console.log(data);
        toast({
          title: "Password Reset link sent to your mail",
          description: "Check your email inbox for password reset link!",
          duration: 5000,
        });
      } else {
        setLoading(false);
        console.log(data);
        toast({
          title: "Can't send reset link",
          description:
            data?.message || "An Exception Occured, Try Again later!",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast({
        title: "Can't send reset link",
        description: "An Exception Occured, Try Again later!",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  

  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <p className="text-2xl font-semibold">Reset your password !</p>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form
          onSubmit={onSubmit}
          className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 space-y-4"
        >
          <Label>Email</Label>
          <Input
            onChange={(e: any) => setEmail(e.target.value)}
            type="email"
            name="email"
            required
            placeholder="Enter your email"
          />
          <Button disabled={loading} type="submit" className="w-full">
            {loading && (
              <Loader2 className="inline mr-2 animate-spin" size={20} />
            )}
            Send password reset link
          </Button>
        </form>
      </div>
    </div>
  );
};

export default page;
