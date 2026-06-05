"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  MessageCircleQuestion,
  Settings2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import type { ScheduledMessage, WhatsAppStatus } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs"; // 1. Import the useAuth hook from Clerk

export function DashboardOverview() {
  const { isLoaded, isSignedIn } = useAuth(); // 2. Extract state variables
  const { client } = useApi();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [whatsapp, setWhatsapp] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3. CRITICAL: Prevent API calls if Clerk is still initializing or if the user isn't signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [messagesRes, statusRes] = await Promise.all([
          client.get<ScheduledMessage[]>("/messages"),
          client.get<WhatsAppStatus>("/whatsapp/status"),
        ]);
        setMessages(messagesRes.data);
        setWhatsapp(statusRes.data);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [client, isLoaded, isSignedIn]); // 4. Add dependencies so it fires immediately when auth initializes

  const sent = messages.filter((m) => m.status === "sent");
  const pending = messages.filter((m) => m.status === "pending");
  const failed = messages.filter((m) => m.status === "failed");
  const nextPending = pending.sort(
    (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  )[0];

  // 5. Show the spinner while Clerk is authenticating OR while data is fetching from Render
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your messaging.
          </p>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
          <Link href="/dashboard/schedule">Schedule Message</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sent.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextPending
                ? `Next in ${formatDistanceToNow(new Date(nextPending.scheduled_time))}`
                : "No upcoming messages"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <MessageCircleQuestion className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{failed.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sent.length + failed.length > 0
                ? `${Math.round((sent.length / (sent.length + failed.length)) * 100)}% delivery rate`
                : "No messages sent yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Status</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold flex items-center gap-2 ${
                whatsapp?.status === "connected" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-2 w-2 rounded-full ${
                  whatsapp?.status === "connected"
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground"
                }`}
              />
              {whatsapp?.status === "connected" ? "Connected" : "Disconnected"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {whatsapp?.last_connected
                ? `Last synced ${formatDistanceToNow(new Date(whatsapp.last_connected))} ago`
                : "Not connected yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>A log of your recently executed scheduled messages.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sent messages yet.</p>
            ) : (
              <div className="space-y-8">
                {sent.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[280px]">
                        {msg.message}
                      </p>
                      <p className="text-sm text-muted-foreground">To: {msg.recipient_number}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 font-medium">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.scheduled_time), "MMM d, h:mm a")}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Messages scheduled for the future.</CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming messages.</p>
            ) : (
              <div className="space-y-8">
                {pending.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                        {msg.message}
                      </p>
                      <p className="text-sm text-muted-foreground">To: {msg.recipient_number}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {format(new Date(msg.scheduled_time), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}