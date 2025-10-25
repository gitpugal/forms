export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/workspaces/:path*",
    "/form/:path*",
    "/settings/profile",
    "/members",
    "/trash",
  ],
};
