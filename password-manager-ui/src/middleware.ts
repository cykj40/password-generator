import { clerkMiddleware } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
export default clerkMiddleware();

// Stop Middleware running on static files and api routes
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 