import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* Your existing config options go here */
};

// Wrap your nextConfig with the PWA setup configuration
export default withPWA({
  dest: "public",                                // Where the production service worker files will be built
  disable: process.env.NODE_ENV === "development", // Keeps PWA features off during local dev to prevent caching old code
  register: true,                               // Autoregisters the service worker on the client phone browser
           // Tells the new worker to take over immediately when a deployment code change happens
})(nextConfig);