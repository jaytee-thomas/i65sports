import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't need authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/hot-takes-public(.*)',
  '/api/hot-takes(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, request) => {
  // Just check if it's a public route, don't call protect()
  if (!isPublicRoute(request)) {
    // For now, allow all requests (we'll add auth later)
    // auth.protect() would block without proper auth setup
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
