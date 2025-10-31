import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/hot-takes",
  "/reels",
  "/columnists",
  "/sign-in(.*)",
  "/sign-up(.*)",
];

const PUBLIC_API_ROUTES = ["/api/odds(.*)"];

const isPublicRoute = createRouteMatcher([...PUBLIC_ROUTES, ...PUBLIC_API_ROUTES]);
const isPublicApiRoute = createRouteMatcher(PUBLIC_API_ROUTES);

const redirectUrlFor = (req: Request, path: string) => {
  const url = new URL(path, req.url);
  return url;
};

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const authRedirect = redirectUrlFor(req, process.env.CLERK_SIGN_IN_URL || "/sign-in");
  authRedirect.searchParams.set("redirect_url", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  const unauthorizedRedirect = redirectUrlFor(req, "/unauthorized");

  try {
    auth().protect({
      unauthenticatedUrl: authRedirect.toString(),
      unauthorizedUrl: unauthorizedRedirect.toString(),
    });
    return NextResponse.next();
  } catch (error: any) {
    if (error?.message === "CLERK_PROTECT_REDIRECT_TO_URL") {
      if (isApiRoute && !isPublicApiRoute(req)) {
        const status = error.redirectUrl?.includes("/unauthorized") ? 403 : 401;
        const message = status === 403 ? "Forbidden" : "Unauthorized";
        return NextResponse.json({ error: message }, { status });
      }
      return NextResponse.redirect(error.redirectUrl);
    }

    if (isApiRoute && !isPublicApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(authRedirect);
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};
