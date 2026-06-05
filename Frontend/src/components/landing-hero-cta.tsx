"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingHeroCta() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Button
        size="lg"
        className="rounded-full h-14 px-8 text-base font-semibold shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
        asChild
      >
        <Link href="/dashboard">
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
      <Button
        size="lg"
        className="rounded-full h-14 px-8 text-base font-semibold shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
        asChild
      >
        <Link href="/sign-up">
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold" asChild>
        <Link href="/sign-in">Log in</Link>
      </Button>
    </div>
  );
}
