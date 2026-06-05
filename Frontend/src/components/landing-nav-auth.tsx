"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PwaInstallButton } from "@/components/pwa-install-button"; // 1. Import the PWA install button component

export function LandingNavAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        {/* Shows compact install button inline if user is on mobile and not running the PWA */}
        <PwaInstallButton variant="nav" />
        
        <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Shows compact install button inline next to auth links if user is on mobile and not running the PWA */}
      <PwaInstallButton variant="nav" />

      <Link
        className="text-sm font-medium hover:text-primary transition-colors"
        href="/sign-in"
      >
        Log in
      </Link>
      
      <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  );
}