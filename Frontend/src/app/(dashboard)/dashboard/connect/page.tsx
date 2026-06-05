"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApi, streamWhatsAppQR } from "@/lib/api";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "failed";

export default function ConnectPage() {
  const { client, getToken } = useApi();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await client.get<{ status: ConnectionStatus }>("/whatsapp/status");
        if (data.status === "connected") {
          setStatus("connected");
        }
      } catch {
        // User may not be synced yet; ignore on initial load
      }
    };

    checkStatus();

    return () => {
      abortRef.current?.abort();
    };
  }, [client]);

  const initiateConnection = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("connecting");
    setQrCode(null);

    try {
      const token = await getToken();
      if (!token) {
        toast.error("You must be signed in to connect WhatsApp");
        setStatus("failed");
        return;
      }

      await streamWhatsAppQR(
        token,
        (event) => {
          if (event.status === "qr" && event.qr) {
            setQrCode(event.qr);
          } else if (event.status === "connected") {
            setStatus("connected");
            setQrCode(null);
            toast.success("WhatsApp connected successfully!");
          } else if (event.status === "disconnected") {
            setStatus("disconnected");
            setQrCode(null);
          } else if (event.status === "failed") {
            setStatus("failed");
            toast.error(event.error || "Connection failed");
          }
        },
        abortRef.current.signal
      );
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setStatus("failed");
        toast.error(error.message || "Failed to connect to WhatsApp");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connect WhatsApp</h1>
        <p className="text-muted-foreground mt-1">
          Link your WhatsApp account to start scheduling messages automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card/50 backdrop-blur-md border-primary/20">
          <CardHeader>
            <CardTitle>Scan to Connect</CardTitle>
            <CardDescription>Open WhatsApp on your phone and link a device.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            {status === "disconnected" && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-muted p-4 rounded-3xl">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your session is safely stored in our secure vault. We only use it to send your
                  scheduled messages.
                </p>
                <Button onClick={initiateConnection} className="mt-4 shadow-lg shadow-primary/20">
                  Generate QR Code
                </Button>
              </div>
            )}

            {status === "connecting" && !qrCode && (
              <div className="flex flex-col items-center text-center space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm font-medium">Generating secure QR code...</p>
              </div>
            )}

            {status === "connecting" && qrCode && (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-[200px] h-[200px]" />
                </div>
                <p className="text-sm animate-pulse text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Waiting for scan...
                </p>
              </div>
            )}

            {status === "connected" && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/20 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <p className="text-lg font-bold">Successfully Connected!</p>
                <p className="text-sm text-muted-foreground">Your device is linked.</p>
                <Button
                  onClick={() => {
                    abortRef.current?.abort();
                    setStatus("disconnected");
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Disconnect
                </Button>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-destructive/20 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <p className="text-lg font-bold">Connection Failed</p>
                <p className="text-sm text-muted-foreground">
                  The QR code expired or an error occurred.
                </p>
                <Button onClick={initiateConnection} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/30 border-dashed">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                <li>Open WhatsApp on your phone</li>
                <li>
                  Tap <strong>Menu</strong> or <strong>Settings</strong> and select{" "}
                  <strong>Linked Devices</strong>
                </li>
                <li>
                  Tap on <strong>Link a Device</strong>
                </li>
                <li>Point your phone to this screen to capture the QR code</li>
              </ol>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription className="text-xs mt-2 text-muted-foreground">
              To keep your session active, you must visit your dashboard at least once every 14
              days. If the session expires, you will need to reconnect your account.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
