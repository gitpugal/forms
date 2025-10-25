"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import Loader from "@/app/components/Loader";
import { ArrowRightIcon } from "lucide-react";
const Page = ({ params }: { params: { id: string } }) => {
  const authKey = params.id;
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [credentialsMissing, setCredentialsMissing] = useState(true); // Set initial credentialsMissing state to true
  const { width, height } = useWindowSize();
  const [AlreadyVerified, setAlreadyVerified] = useState(false);
  let isCalled = false;
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
          `/api/verify/${authKey}?user_id=${user_id}`
        );
        console.log(response.status);
        if (response.status == 200) {
          setVerified(true);
        } else if (response.status == 202) {
          setAlreadyVerified(true);
          setVerified(false);
        } else {
          setVerified(false);
        }
      } catch (error) {
        console.log(error);
        setVerified(false);
      } finally {
        setLoading(false); // Set loading to false after verification process completes
      }
    };
    if (!isCalled) {
      verifyUser();
    }
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      {loading ? (
        <Loader />
      ) : (
        <>
          {credentialsMissing ? (
            <div className="w-full h-full flex items-center justify-center flex-col">
              <p className="text-2xl font-semibold text-red-600">
                Uh oh!, Not a valid verification link.
              </p>
              <p className="text-center">
                Check your email for a valid verification link
              </p>
            </div>
          ) : verified ? (
            <>
              {" "}
              <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={1500}
                friction={1}
                tweenDuration={5000}
              />
              <p className="text-xl md:text-3xl text-center font-semibold text-green-600">
                Your account has been verified!
              </p>
              <p className="text-center mt-2">
                Go to the login page and login.
              </p>
              <a href={"/login"} className="text-xl mt-3 font-semibold group">
                Login
                <span className="inline ease-in-out duration-200 relative top-[0.7px] pl-1 group-hover:pl-3">
                  -&gt;
                </span>
              </a>
            </>
          ) : AlreadyVerified ? (
            <>
              <p className="text-xl md:text-5xl text-center text-orange-500 font-semibold">
                Your account is already verified!
              </p>
              <p className="text-center mt-2">
                Go to the login page and login.
              </p>
              <a href={"/login"} className="text-xl mt-3 font-semibold group">
                Login
                <ArrowRightIcon
                  size={30}
                  className="inline ease-in-out duration-200 relative top-[0.7px] ml-1 group-hover:ml-3"
                />
              </a>
            </>
          ) : (
            <>
              {" "}
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
