import Link from "next/link";
import { LandingNavAuth } from "@/components/landing-nav-auth";
import { LandingHeroCta } from "@/components/landing-hero-cta";
import { MessageCircle, Clock, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Pingly</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <LandingNavAuth />
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 flex justify-center items-center relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              WhatsApp Automation is here
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Schedule WhatsApp Messages with Ease.
            </h1>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
              Never forget to send a birthday wish, meeting reminder, or follow-up again. 
              Connect your account securely and automate your messaging in seconds.
            </p>
            
            <LandingHeroCta />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-card/30 border-t border-border/50 flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Designed for Simplicity</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Everything you need to automate your WhatsApp communication, packaged in a beautiful interface.
              </p>
            </div>
            
            <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-3">
              <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Precision Scheduling</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set exact dates and times for your messages to be sent down to the minute. Handle timezones effortlessly.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Recurring Messages</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up daily, weekly, or monthly recurring messages for team reminders or regular client check-ins.
                </p>
              </div>

              <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Secure Connection</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your session is securely established via QR code. Messages are sent directly from your own WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t font-medium text-muted-foreground bg-card/50">
        <p className="text-xs">© {new Date().getFullYear()} Pingly Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
