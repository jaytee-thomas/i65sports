import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/hot-takes",
  "/reels",
  "/columnists",
  "/api/odds(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect(); // require a signed-in user for non-public paths
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};
