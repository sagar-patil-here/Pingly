"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
// This middleware throws an unauthenticated error if the request doesn't have a valid Clerk JWT.
exports.requireAuth = (0, clerk_sdk_node_1.ClerkExpressRequireAuth)();
