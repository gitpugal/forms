import { FC } from "react";
// import { GoogleIcon } from "./icons";

interface ThirdPartyLoginProps {
  headline?: string;
  subHeadline?: string;
  handleSignInWithGoogle: any;
}

export const ThirdPartyLogin: FC<ThirdPartyLoginProps> = ({
  headline,
  subHeadline,
  handleSignInWithGoogle,
}) => {
  function handleSignInWithApple() {}

  return (
    <div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500">{subHeadline}</span>
        </div>
      </div>
      {/* <p className="text-sm font-medium text-slate-700"> {headline}</p> */}

      <div className="mt-2 grid grid-cols-1 gap-2">
        <div>
          <div
            className="inline-flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm hover:bg-slate-50"
            onClick={handleSignInWithGoogle}
          >
            {/* <GoogleIcon className="h-5 w-5 mr-2" /> */}
            <span className="">Google</span>
          </div>
        </div>
      </div>
    </div>
  );
};
