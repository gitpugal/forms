import LogoComponent from "@/components/LogoComponent";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-screen bg-white h-screen flex flex-col items-center justify-center gap-5">
      <LogoComponent className="" />
      <h2 className="text-3xl font-semibold">Not Found</h2>
      <p className="text-xl font-semibold opacity-70">
        Could not find requested resource
      </p>
      <Link href="/" className="shadow-custom border p-2 rounded-md">
        Return Home
      </Link>
    </div>
  );
}
