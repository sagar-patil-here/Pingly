import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. Viewport configuration required for next.js PWA bar colors and input responsiveness
export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents iOS from forcing annoying layout zoom-ins on form inputs
};

// 2. Metadata enhanced with manifest declaration and apple status bar styles
export const metadata: Metadata = {
  title: "Pingly | WhatsApp message scheduling SaaS",
  description: "Automate WhatsApp messaging, schedule reminders, and more.",
  manifest: "/manifest.json", // Directs mobile phone browsers to your app configuration definitions
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pingly",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* 3. Explicit fallback flags forcing iOS Safari to render full screen standalone apps */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body
          className={`${inter.className} min-h-screen flex flex-col bg-background antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}