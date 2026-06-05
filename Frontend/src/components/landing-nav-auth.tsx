"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function LandingNavAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Link
        className="text-sm font-medium hover:text-primary transition-colors"
        href="/sign-in"
      >
        Log in
      </Link>
      <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </>
  );
}
