import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// This middleware throws an unauthenticated error if the request doesn't have a valid Clerk JWT.
export const requireAuth = ClerkExpressRequireAuth();
