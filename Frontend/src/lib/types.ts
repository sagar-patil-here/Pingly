export interface ScheduledMessage {
  id: string;
  user_id: string;
  recipient_number: string;
  message: string;
  scheduled_time: string;
  recurrence_type: "once" | "daily" | "weekly" | "monthly";
  status: "pending" | "sent" | "failed" | "cancelled";
  created_at: string;
}

export interface WhatsAppStatus {
  status: "connected" | "disconnected" | "connecting";
  last_connected: string | null;
}

export type WhatsAppSSEEvent =
  | { status: "connected" }
  | { status: "qr"; qr: string }
  | { status: "disconnected" }
  | { status: "failed"; error?: string };
